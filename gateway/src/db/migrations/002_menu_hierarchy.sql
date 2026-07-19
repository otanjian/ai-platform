USE aiplatform;

ALTER TABLE role_menu_permission
  ADD COLUMN parent_code VARCHAR(64) NULL AFTER menu_code,
  ADD COLUMN display_name VARCHAR(128) NULL AFTER parent_code,
  ADD COLUMN icon VARCHAR(64) NULL AFTER display_name,
  ADD COLUMN sort_order INT UNSIGNED DEFAULT 0 AFTER icon,
  ADD INDEX idx_parent_menu (parent_code, menu_code);
