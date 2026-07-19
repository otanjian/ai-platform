import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL || "mysql://aiplatform:aiplatform@localhost:3306/aiplatform";

export const pool = mysql.createPool({
  uri: databaseUrl,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });

export type DB = typeof db;
