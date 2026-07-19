USE aiplatform;

CREATE TABLE IF NOT EXISTS role_field_permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  resource VARCHAR(64) NOT NULL,
  field VARCHAR(64) NOT NULL,
  permission ENUM('none', 'read', 'write') DEFAULT 'none',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_role_resource_field (role_id, resource, field),
  FOREIGN KEY (role_id) REFERENCES platform_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
