USE aiplatform;

CREATE TABLE IF NOT EXISTS opencode_session (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  platform_user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255),
  directory VARCHAR(512),
  status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_opencode_session_id (session_id),
  INDEX idx_opencode_session_user_project (platform_user_id, project_id),
  INDEX idx_opencode_session_project_updated (project_id, updated_at),
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_user_id) REFERENCES platform_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
