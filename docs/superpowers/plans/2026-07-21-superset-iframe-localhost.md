# Superset iframe localhost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Data Insights Superset iframe same-site with the platform so `?_t=` session cookies stick and auto-login works.

**Architecture:** Change Superset UI `baseUrl` default/example to `http://localhost:9060`; keep API on `http://127.0.0.1:9068`. Assert in topology test. Update local gitignored config and startup notes.

**Tech Stack:** Bun gateway config, bun:test, YAML config

**Spec:** `docs/superpowers/specs/2026-07-21-superset-iframe-localhost-design.md`

---

### Task 1: Failing topology assertion

**Files:**
- Modify: `gateway/tests/subsystem-topology.test.ts`

- [ ] **Step 1: Extend test** to expect `subsystems.superset.baseUrl === "http://localhost:9060"` and `apiBaseUrl === "http://127.0.0.1:9068"` (mirror BuildingAI comment).

- [ ] **Step 2: Run** `cd gateway && bun test tests/subsystem-topology.test.ts` — confirm RED on baseUrl.

### Task 2: Defaults + examples

**Files:**
- Modify: `gateway/src/config.ts`
- Modify: `gateway/config.example.yaml`
- Modify: `gateway/config.yaml` (gitignored, local only)
- Modify: `start-local.sh`
- Modify: `.cursor/rules/local-services.mdc`

- [ ] **Step 1: Change** Superset `baseUrl` default/example/local to `http://localhost:9060`; leave `apiBaseUrl` as `http://127.0.0.1:9068`. Add brief comment like BuildingAI.

- [ ] **Step 2: Run** topology test — GREEN.

- [ ] **Step 3: Restart** gateway; confirm `/api/bi/embed-session` returns `uiBaseUrl` with `localhost:9060`.

### Task 3: Manual check

- [ ] Open `http://localhost:3000/data-insights/dashboards` while logged in — no Superset Sign in modal.
