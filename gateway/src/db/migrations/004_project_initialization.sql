USE aiplatform;

CREATE TABLE IF NOT EXISTS project (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  project_path VARCHAR(512) NOT NULL UNIQUE,
  owner_id BIGINT UNSIGNED NOT NULL,
  organization_id VARCHAR(64),
  template_id BIGINT UNSIGNED,
  status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_owner (owner_id),
  INDEX idx_project_organization (organization_id),
  INDEX idx_project_status (status),
  FOREIGN KEY (owner_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_member (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  platform_user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_project_member (project_id, platform_user_id),
  INDEX idx_project_member_project (project_id),
  INDEX idx_project_member_user (platform_user_id),
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_template (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  type ENUM('web', 'api', 'script', 'mobile', 'custom') NOT NULL,
  default_project_path VARCHAR(512),
  extra_config JSON,
  organization_id VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_template_organization (organization_id),
  INDEX idx_project_template_type (type),
  FOREIGN KEY (created_by) REFERENCES platform_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
