CREATE DATABASE IF NOT EXISTS aiplatform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE aiplatform;

CREATE TABLE IF NOT EXISTS platform_role (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  keycloak_role_name VARCHAR(64) NOT NULL,
  display_name VARCHAR(128),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_keycloak_role_name (keycloak_role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_user (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keycloak_user_id VARCHAR(64) NOT NULL UNIQUE,
  username VARCHAR(128) NOT NULL,
  email VARCHAR(255),
  default_role_id BIGINT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_keycloak_user_id (keycloak_user_id),
  FOREIGN KEY (default_role_id) REFERENCES platform_role(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_menu_permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  menu_code VARCHAR(64) NOT NULL,
  permission ENUM('none', 'read', 'write', 'admin') DEFAULT 'none',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_role_menu (role_id, menu_code),
  FOREIGN KEY (role_id) REFERENCES platform_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_system_token (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  platform_user_id BIGINT UNSIGNED NOT NULL,
  system ENUM('dataease', 'buildingai') NOT NULL,
  token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_system (platform_user_id, system),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  platform_user_id BIGINT UNSIGNED,
  action VARCHAR(64),
  subsystem ENUM('opencode', 'dataease', 'buildingai', 'platform'),
  request_path VARCHAR(512),
  request_method VARCHAR(16),
  status_code INT,
  ip_address VARCHAR(64),
  user_agent VARCHAR(512),
  request_body JSON,
  response_body JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_time (platform_user_id, created_at),
  INDEX idx_subsystem_time (subsystem, created_at),
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pipeline_definition (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  dag_json JSON NOT NULL,
  trigger_type ENUM('manual', 'cron', 'webhook', 'event') DEFAULT 'manual',
  cron_expression VARCHAR(128),
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_by (created_by),
  INDEX idx_trigger_type (trigger_type),
  FOREIGN KEY (created_by) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pipeline_execution (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pipeline_definition_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'running', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  trigger_source VARCHAR(64),
  triggered_by BIGINT UNSIGNED,
  input_payload JSON,
  output_payload JSON,
  error_message TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pipeline_status (pipeline_definition_id, status),
  INDEX idx_started_at (started_at),
  FOREIGN KEY (pipeline_definition_id) REFERENCES pipeline_definition(id) ON DELETE CASCADE,
  FOREIGN KEY (triggered_by) REFERENCES platform_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pipeline_execution_step (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pipeline_execution_id BIGINT UNSIGNED NOT NULL,
  step_name VARCHAR(128) NOT NULL,
  step_index INT UNSIGNED NOT NULL,
  subsystem ENUM('opencode', 'dataease', 'buildingai'),
  status ENUM('pending', 'running', 'success', 'failed', 'skipped') DEFAULT 'pending',
  input_payload JSON,
  output_payload JSON,
  error_message TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_execution_step (pipeline_execution_id, step_index),
  FOREIGN KEY (pipeline_execution_id) REFERENCES pipeline_execution(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subsystem_config (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  system ENUM('opencode', 'dataease', 'buildingai') NOT NULL UNIQUE,
  base_url VARCHAR(512) NOT NULL,
  auth_type ENUM('none', 'oidc', 'token', 'saml') NOT NULL,
  client_id VARCHAR(128),
  client_secret TEXT,
  admin_username VARCHAR(128),
  admin_password TEXT,
  platform_oid VARCHAR(64),
  platform_rid VARCHAR(64),
  extra_config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_api_key (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL UNIQUE,
  scopes JSON,
  created_by BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME,
  last_used_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_channel (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  channel_type ENUM('email', 'webhook', 'wecom', 'dingtalk', 'lark') NOT NULL,
  config JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS organization_skill (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  organization_id VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_organization (organization_id),
  FOREIGN KEY (created_by) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_setting (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(128) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_preference (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  platform_user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  preferences JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_record (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  channel_id BIGINT UNSIGNED NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_channel_status (channel_id, status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (channel_id) REFERENCES notification_channel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_project (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  platform_user_id BIGINT UNSIGNED NOT NULL,
  project_name VARCHAR(128) NOT NULL,
  project_path VARCHAR(512),
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_project (platform_user_id, project_name),
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
