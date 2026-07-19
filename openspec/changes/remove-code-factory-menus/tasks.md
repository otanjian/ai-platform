## 1. Backend menu & data

- [x] 1.1 Remove the five menu items from `gateway/src/db/seed.ts`
- [x] 1.2 Remove the five menu items from `gateway/src/routes/platform.ts` fallback list
- [x] 1.3 Add migration deleting `role_menu_permission` rows for the five `menu_code`s and apply it

## 2. Frontend routes & pages

- [x] 2.1 Remove routes/imports for the five pages from `CodeFactoryPage.tsx`
- [x] 2.2 Delete the corresponding page components under `frontend/src/pages/code-factory/`

## 3. Docs & verify

- [x] 3.1 Update `方案思路.md` Code Factory menu tree and related sections for the five removals
- [x] 3.2 Verify sidebar no longer shows the five items; remaining Code Factory menus still work
