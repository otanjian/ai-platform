import {
  mysqlTable,
  bigint,
  varchar,
  text,
  datetime,
  json,
  boolean,
  int,
  mysqlEnum,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";

export const platformRole = mysqlTable(
  "platform_role",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 64 }).notNull().unique(),
    keycloakRoleName: varchar("keycloak_role_name", { length: 64 }).notNull(),
    displayName: varchar("display_name", { length: 128 }),
    description: text("description"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    keycloakRoleNameIdx: index("idx_keycloak_role_name").on(table.keycloakRoleName),
  })
);

export const platformUser = mysqlTable(
  "platform_user",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    keycloakUserId: varchar("keycloak_user_id", { length: 64 }).notNull().unique(),
    username: varchar("username", { length: 128 }).notNull(),
    email: varchar("email", { length: 255 }),
    defaultRoleId: bigint("default_role_id", { mode: "number", unsigned: true }),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    keycloakUserIdIdx: index("idx_keycloak_user_id").on(table.keycloakUserId),
  })
);

export const roleMenuPermission = mysqlTable(
  "role_menu_permission",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
    menuCode: varchar("menu_code", { length: 64 }).notNull(),
    parentCode: varchar("parent_code", { length: 64 }),
    displayName: varchar("display_name", { length: 128 }),
    icon: varchar("icon", { length: 64 }),
    sortOrder: int("sort_order", { unsigned: true }).default(0),
    permission: mysqlEnum("permission", ["none", "read", "write", "admin"]).default("none"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    uniqRoleMenu: uniqueIndex("uniq_role_menu").on(table.roleId, table.menuCode),
  })
);

export const roleFieldPermission = mysqlTable(
  "role_field_permission",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
    resource: varchar("resource", { length: 64 }).notNull(),
    field: varchar("field", { length: 64 }).notNull(),
    permission: mysqlEnum("permission", ["none", "read", "write"]).default("none"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    uniqRoleResourceField: uniqueIndex("uniq_role_resource_field").on(table.roleId, table.resource, table.field),
  })
);

export const userSystemToken = mysqlTable(
  "user_system_token",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    platformUserId: bigint("platform_user_id", { mode: "number", unsigned: true }).notNull(),
    system: mysqlEnum("system", ["dataease", "buildingai"]).notNull(),
    token: text("token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: datetime("expires_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    uniqUserSystem: uniqueIndex("uniq_user_system").on(table.platformUserId, table.system),
    expiresAtIdx: index("idx_expires_at").on(table.expiresAt),
  })
);

export const auditLog = mysqlTable(
  "audit_log",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    platformUserId: bigint("platform_user_id", { mode: "number", unsigned: true }),
    action: varchar("action", { length: 64 }),
    subsystem: mysqlEnum("subsystem", ["opencode", "dataease", "buildingai", "platform"]),
    requestPath: varchar("request_path", { length: 512 }),
    requestMethod: varchar("request_method", { length: 16 }),
    statusCode: int("status_code"),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 512 }),
    requestBody: json("request_body"),
    responseBody: json("response_body"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    userTimeIdx: index("idx_user_time").on(table.platformUserId, table.createdAt),
    subsystemTimeIdx: index("idx_subsystem_time").on(table.subsystem, table.createdAt),
  })
);

export const pipelineDefinition = mysqlTable(
  "pipeline_definition",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    dagJson: json("dag_json").notNull(),
    triggerType: mysqlEnum("trigger_type", ["manual", "cron", "webhook", "event"]).default("manual"),
    cronExpression: varchar("cron_expression", { length: 128 }),
    webhookSecret: varchar("webhook_secret", { length: 255 }),
    isActive: boolean("is_active").default(true),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    createdByIdx: index("idx_created_by").on(table.createdBy),
    triggerTypeIdx: index("idx_trigger_type").on(table.triggerType),
  })
);

export const pipelineExecution = mysqlTable(
  "pipeline_execution",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    pipelineDefinitionId: bigint("pipeline_definition_id", { mode: "number", unsigned: true }).notNull(),
    status: mysqlEnum("status", ["pending", "running", "success", "failed", "cancelled"]).default("pending"),
    triggerSource: varchar("trigger_source", { length: 64 }),
    triggeredBy: bigint("triggered_by", { mode: "number", unsigned: true }),
    inputPayload: json("input_payload"),
    outputPayload: json("output_payload"),
    errorMessage: text("error_message"),
    startedAt: datetime("started_at", { mode: "date" }),
    finishedAt: datetime("finished_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    pipelineStatusIdx: index("idx_pipeline_status").on(table.pipelineDefinitionId, table.status),
    startedAtIdx: index("idx_started_at").on(table.startedAt),
  })
);

export const pipelineExecutionStep = mysqlTable(
  "pipeline_execution_step",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    pipelineExecutionId: bigint("pipeline_execution_id", { mode: "number", unsigned: true }).notNull(),
    stepName: varchar("step_name", { length: 128 }).notNull(),
    stepIndex: int("step_index", { unsigned: true }).notNull(),
    subsystem: mysqlEnum("subsystem", ["opencode", "dataease", "buildingai"]),
    status: mysqlEnum("status", ["pending", "running", "success", "failed", "skipped"]).default("pending"),
    inputPayload: json("input_payload"),
    outputPayload: json("output_payload"),
    errorMessage: text("error_message"),
    startedAt: datetime("started_at", { mode: "date" }),
    finishedAt: datetime("finished_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    executionStepIdx: index("idx_execution_step").on(table.pipelineExecutionId, table.stepIndex),
  })
);

export const subsystemConfig = mysqlTable(
  "subsystem_config",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    system: mysqlEnum("system", ["opencode", "dataease", "buildingai"]).notNull().unique(),
    baseUrl: varchar("base_url", { length: 512 }).notNull(),
    authType: mysqlEnum("auth_type", ["none", "oidc", "token", "saml"]).notNull(),
    clientId: varchar("client_id", { length: 128 }),
    clientSecret: text("client_secret"),
    adminUsername: varchar("admin_username", { length: 128 }),
    adminPassword: text("admin_password"),
    platformOid: varchar("platform_oid", { length: 64 }),
    platformRid: varchar("platform_rid", { length: 64 }),
    extraConfig: json("extra_config"),
    isActive: boolean("is_active").default(true),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  }
);

export const platformApiKey = mysqlTable(
  "platform_api_key",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    apiKeyHash: varchar("api_key_hash", { length: 255 }).notNull().unique(),
    scopes: json("scopes"),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date" }),
    lastUsedAt: datetime("last_used_at", { mode: "date" }),
    isActive: boolean("is_active").default(true),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    createdByIdx: index("idx_created_by").on(table.createdBy),
  })
);

export const notificationChannel = mysqlTable(
  "notification_channel",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    channelType: mysqlEnum("channel_type", ["email", "webhook", "wecom", "dingtalk", "lark"]).notNull(),
    config: json("config").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  }
);

export const organizationSkill = mysqlTable(
  "organization_skill",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    content: text("content").notNull(),
    organizationId: varchar("organization_id", { length: 64 }),
    isActive: boolean("is_active").default(true),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    organizationIdx: index("idx_organization").on(table.organizationId),
  })
);

export const systemSetting = mysqlTable(
  "system_setting",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    settingKey: varchar("setting_key", { length: 128 }).notNull().unique(),
    settingValue: text("setting_value"),
    description: text("description"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  }
);

export const userPreference = mysqlTable(
  "user_preference",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    platformUserId: bigint("platform_user_id", { mode: "number", unsigned: true }).notNull().unique(),
    preferences: json("preferences"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  }
);

export const notificationRecord = mysqlTable(
  "notification_record",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    channelId: bigint("channel_id", { mode: "number", unsigned: true }).notNull(),
    recipient: varchar("recipient", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    content: text("content"),
    status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending"),
    errorMessage: text("error_message"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    channelStatusIdx: index("idx_channel_status").on(table.channelId, table.status),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
  })
);

export const project = mysqlTable(
  "project",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    projectPath: varchar("project_path", { length: 512 }).notNull().unique(),
    ownerId: bigint("owner_id", { mode: "number", unsigned: true }).notNull(),
    organizationId: varchar("organization_id", { length: 64 }),
    templateId: bigint("template_id", { mode: "number", unsigned: true }),
    status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    ownerIdx: index("idx_project_owner").on(table.ownerId),
    orgIdx: index("idx_project_organization").on(table.organizationId),
    statusIdx: index("idx_project_status").on(table.status),
  })
);

export const projectMember = mysqlTable(
  "project_member",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
    platformUserId: bigint("platform_user_id", { mode: "number", unsigned: true }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    uniqProjectMember: uniqueIndex("uniq_project_member").on(table.projectId, table.platformUserId),
    projectIdx: index("idx_project_member_project").on(table.projectId),
    userIdx: index("idx_project_member_user").on(table.platformUserId),
  })
);

export const projectTemplate = mysqlTable(
  "project_template",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["web", "api", "script", "mobile", "custom"]).notNull(),
    defaultProjectPath: varchar("default_project_path", { length: 512 }),
    extraConfig: json("extra_config"),
    organizationId: varchar("organization_id", { length: 64 }),
    isActive: boolean("is_active").default(true),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    orgIdx: index("idx_project_template_organization").on(table.organizationId),
    typeIdx: index("idx_project_template_type").on(table.type),
  })
);

export const opencodeSession = mysqlTable(
  "opencode_session",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
    platformUserId: bigint("platform_user_id", { mode: "number", unsigned: true }).notNull(),
    title: varchar("title", { length: 255 }),
    directory: varchar("directory", { length: 512 }),
    status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active"),
    createdAt: datetime("created_at", { mode: "date" }).default(new Date()),
    updatedAt: datetime("updated_at", { mode: "date" }).default(new Date()),
  },
  (table) => ({
    uniqSessionId: uniqueIndex("uniq_opencode_session_id").on(table.sessionId),
    userProjectIdx: index("idx_opencode_session_user_project").on(table.platformUserId, table.projectId),
    projectUpdatedIdx: index("idx_opencode_session_project_updated").on(table.projectId, table.updatedAt),
  })
);
