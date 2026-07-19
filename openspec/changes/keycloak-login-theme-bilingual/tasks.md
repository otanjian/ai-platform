## 1. Theme scaffold and deploy wiring

- [x] 1.1 Create `keycloak/themes/aiplatform/login/` with `theme.properties` (parent theme confirmed for Keycloak 25.0)
- [x] 1.2 Mount themes directory in `keycloak/docker-compose.yaml` and root `docker-compose.yml`
- [x] 1.3 Update `realm-import.json`: `loginTheme=aiplatform`, enable internationalization, default locale `zh-CN`

## 2. Layout templates

- [x] 2.1 Override login page template for split-panel shell (brand left / form right, stacked on mobile)
- [x] 2.2 Override reset-password template with same shell and bilingual headings
- [x] 2.3 Override error page template with same shell and bilingual messaging hooks

## 3. Visual style and motion

- [x] 3.1 Add `resources/css/login.css` for neural glow, glass form panel, bilingual typography
- [x] 3.2 Add `resources/js/neural-bg.js` (or SVG/CSS) for node/link animation; honor `prefers-reduced-motion`
- [x] 3.3 Wire CSS/JS assets from templates / theme.properties

## 4. Bilingual messages

- [x] 4.1 Add Chinese-primary bilingual strings for login, reset password, and common error keys in theme messages
- [x] 4.2 Ensure brand title uses 企业级 AI 智造平台 / Enterprise AI Manufacturing Platform

## 5. Verification

- [x] 5.1 Restart Keycloak and verify login page layout, bilingual copy, and theme binding
- [x] 5.2 Verify forgot-password and a sample error page use the same theme
- [x] 5.3 Spot-check mobile width stacking and reduced-motion behavior
- [x] 5.4 Update `keycloak/README.md` with theme path, binding notes, and rollback (`loginTheme` back to default)
