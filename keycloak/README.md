# Keycloak for AI Platform

Local Keycloak setup for OIDC authentication (`aiplatform` realm).

## Prerequisites

- Docker Compose

## Start Keycloak

```bash
cd /Users/jiantan/ai_assistant/aiplatform/keycloak
docker compose up -d
```

Keycloak will be available at `http://localhost:8080` after ~20-30 seconds.

## Default Credentials

- **Admin Console**: `http://localhost:8080/admin`
  - Username: `admin`
  - Password: `admin`
- **Realm**: `aiplatform`
- **Login theme**: `aiplatform` (custom bilingual theme under `themes/aiplatform/`)

## Custom login theme

Theme files live in:

```text
keycloak/themes/aiplatform/login/
```

Docker Compose mounts `./themes` to `/opt/keycloak/themes`. Realm import sets:

- `loginTheme`: `aiplatform`
- `internationalizationEnabled`: `true`
- `defaultLocale`: `zh-CN`

### Apply theme on an existing realm

Realm import does **not** always overwrite an already-imported realm. If the login page still shows the default theme:

1. Admin Console → Realm settings → Themes → Login theme = `aiplatform`, or
2. Recreate the dev database volume:

```bash
docker compose down -v
docker compose up -d
```

### Rollback

Set Login theme back to `keycloak` (or `keycloak.v2`) in Realm settings → Themes, then refresh the login page.

## Stop Keycloak

```bash
docker compose down
```

To remove data volume:

```bash
docker compose down -v
```
