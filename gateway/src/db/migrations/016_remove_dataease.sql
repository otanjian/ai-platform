-- 016: Remove DataEase from subsystem ENUMs and legacy rows.
-- TaskView + Superset replace DataEase for task hub / data insights.

-- Discard obsolete BI tokens (do not remap to superset — tokens are unusable).
DELETE FROM user_system_token WHERE system = 'dataease';

-- Historical labels: treat DataEase activity as Superset.
UPDATE audit_log SET subsystem = 'superset' WHERE subsystem = 'dataease';
UPDATE pipeline_execution_step SET subsystem = 'superset' WHERE subsystem = 'dataease';

DELETE FROM subsystem_config WHERE system = 'dataease';

ALTER TABLE user_system_token
  MODIFY COLUMN system ENUM('superset', 'taskview', 'buildingai') NOT NULL;

ALTER TABLE audit_log
  MODIFY COLUMN subsystem ENUM('opencode', 'taskview', 'superset', 'buildingai', 'platform') NULL;

ALTER TABLE pipeline_execution_step
  MODIFY COLUMN subsystem ENUM('opencode', 'taskview', 'superset', 'buildingai') NULL;

ALTER TABLE subsystem_config
  MODIFY COLUMN system ENUM('opencode', 'taskview', 'superset', 'buildingai') NOT NULL;
