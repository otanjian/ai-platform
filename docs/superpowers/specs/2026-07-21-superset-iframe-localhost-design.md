# Superset iframe same-site auto-login

**Date:** 2026-07-21  
**Status:** Approved

## Problem

Data Insights embeds Superset via gateway `platform-sso` + iframe `?_t=`. Mint works, but the iframe still shows Superset Sign in. TaskView auto-login works for the same platform session.

Root cause: gateway `subsystems.superset.baseUrl` was `http://127.0.0.1:9060` while the platform runs on `http://localhost:3000`. Different hostnames are cross-site; Superset’s `SameSite=Lax` session cookie from `_t` consumption does not stick in the iframe.

## Decision

Match BuildingAI topology:

- **UI (iframe):** `http://localhost:9060`
- **API (gateway mint / proxy):** `http://127.0.0.1:9068`

No protocol changes to Superset `platform-sso`, frontend hard-gate, or guest tokens.

## Scope

- Default + example config for Superset `baseUrl`
- Local `gateway/config.yaml` (gitignored) so the running gateway picks it up
- Topology test asserting localhost UI / 127.0.0.1 API
- Local startup docs that mention the hostname split

## Out of scope

- Keycloak OIDC into Superset
- Cookie `SameSite=None` on Superset
- Moving the whole platform to `127.0.0.1`

## Success criteria

Logged-in platform user opens `/data-insights/dashboards` (and other data-insights leaves) without the Superset Sign in modal. SSO mint failures still surface the existing hard-gate error page.
