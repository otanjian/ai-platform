import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import type { RowDataPacket } from "mysql2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

async function ensureMigrationsTable(connection: Awaited<ReturnType<typeof pool.getConnection>>) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function migrateUserProject(connection: Awaited<ReturnType<typeof pool.getConnection>>) {
  const [tables] = await connection.query<RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_project'`
  );
  if (tables.length === 0) {
    console.log("Skip user_project migration: table already removed");
    return;
  }

  await connection.query(`
    INSERT INTO project (name, description, project_path, owner_id, status, created_at, updated_at)
    SELECT project_name,
           NULL,
           COALESCE(project_path, CONCAT('/migrated/user-project-', id)),
           platform_user_id,
           'active',
           created_at,
           updated_at
    FROM user_project
    WHERE NOT EXISTS (
      SELECT 1 FROM project p
      WHERE p.project_path = COALESCE(user_project.project_path, CONCAT('/migrated/user-project-', user_project.id))
    )
  `);

  await connection.query(`
    INSERT INTO project_member (project_id, platform_user_id, role, created_at, updated_at)
    SELECT p.id, up.platform_user_id, 'owner', up.created_at, up.updated_at
    FROM user_project up
    JOIN project p ON p.project_path = COALESCE(up.project_path, CONCAT('/migrated/user-project-', up.id))
    WHERE NOT EXISTS (
      SELECT 1 FROM project_member pm
      WHERE pm.project_id = p.id AND pm.platform_user_id = up.platform_user_id
    )
  `);

  await connection.query(`DROP TABLE IF EXISTS user_project`);
  console.log("Migrated user_project → project + project_member");
}

async function migrate() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const connection = await pool.getConnection();
  try {
    await ensureMigrationsTable(connection);

    const [appliedRows] = await connection.query<RowDataPacket[]>(
      `SELECT filename FROM schema_migrations`
    );
    const applied = new Set(appliedRows.map((r) => String(r.filename)));

    // Bootstrap: if core tables already exist but no migration records, mark 001-003 as applied
    if (applied.size === 0) {
      const [core] = await connection.query<RowDataPacket[]>(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'platform_user'`
      );
      if (core.length > 0) {
        for (const legacy of ["001_initial.sql", "002_menu_hierarchy.sql", "003_field_permissions.sql"]) {
          if (files.includes(legacy)) {
            await connection.query(`INSERT IGNORE INTO schema_migrations (filename) VALUES (?)`, [legacy]);
            applied.add(legacy);
            console.log(`Bootstrapped migration record: ${legacy}`);
          }
        }
      }
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skip already applied: ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      // Strip full-line SQL comments before splitting so "-- note\nUPDATE ..." is not dropped.
      const withoutLineComments = sql
        .split("\n")
        .map((line) => (line.trimStart().startsWith("--") ? "" : line))
        .join("\n");
      const statements = withoutLineComments
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await connection.query(statement + ";");
      }
      await connection.query(`INSERT INTO schema_migrations (filename) VALUES (?)`, [file]);
      console.log(`Applied migration: ${file}`);
    }

    await migrateUserProject(connection);
    console.log("Database migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
