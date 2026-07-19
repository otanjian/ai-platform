-- Remove retired Code Factory menu entries from role permissions
USE aiplatform;

DELETE FROM role_menu_permission
WHERE menu_code IN (
  'code_factory.terminal',
  'code_factory.mcp',
  'code_factory.models',
  'code_factory.skills',
  'code_factory.share'
);
