## Context

The team runs a local OpenCode instance at `http://127.0.0.1:4096/`. OpenCode stores all sessions, configuration, and state under the current user's XDG directories (`~/.local/share/opencode`, `~/.config/opencode`, etc.). This makes it effectively single-user: multiple developers cannot share the same running instance without seeing and potentially modifying each other's sessions and settings.

The requirement is to let up to 10 local developers use OpenCode independently. Each developer must only be able to open projects they have been assigned to. OpenCode itself must not be modified, so the solution must be an external wrapper that starts and routes to per-user OpenCode child processes.

## Goals / Non-Goals

**Goals:**
- Provide a single gateway entry point (e.g., `http://localhost:9090`) for all developers.
- Authenticate users with local credentials and maintain browser sessions.
- Restrict each user to a configured list of permitted project directories.
- Launch per-user OpenCode child processes with isolated XDG directories.
- Proxy HTTP and WebSocket traffic to the correct child process.
- Keep the implementation lightweight and suitable for a local development environment.

**Non-Goals:**
- Modifying OpenCode source code or forking OpenCode.
- Full SaaS-grade multi-tenancy (network isolation, billing, rate limiting).
- Role-based access control (only a flat allow-list per user is needed).
- HTTPS/TLS termination in the gateway (local environment).
- High availability or horizontal scaling.

## Decisions

- **Gateway runtime: Bun/Node.js**. The existing OpenCode stack already uses Bun, so a Bun-based gateway minimizes toolchain fragmentation. A single file or small directory can run the gateway.
- **Authentication: cookie-based session with local username/password**. No SSO is available in this environment, and 10 users do not justify OAuth complexity. Passwords are stored hashed (bcrypt/argon2).
- **Per-user process isolation with isolated XDG directories**. Each user gets their own `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, and `TMPDIR`. This prevents OpenCode from mixing sessions, history, and config between users without requiring any code changes in OpenCode.
- **Project access control: flat allow-list per user**. A YAML or JSON configuration maps users to project paths. The gateway checks the requested project against the list before launching OpenCode.
- **One OpenCode process per user, dynamic port allocation**. The gateway maintains a `user -> port` mapping. When a user logs in, the gateway starts their process if it is not running. The process is bound to `127.0.0.1` on a dynamic port to avoid exposing the raw OpenCode port directly.
- **Reverse proxy: HTTP and WebSocket upgrade support**. OpenCode's terminal and streaming features rely on WebSocket. The gateway must handle `Upgrade: websocket` requests and forward them to the user's process.
- **Idle process shutdown**. After a configurable idle period, the gateway terminates the user's OpenCode process to save memory. The process is restarted on the next request.
- **No containerization**. For 10 local users, process + filesystem isolation is sufficient and lighter than Docker per user.

## Risks / Trade-offs

- [Risk] OpenCode's built-in `auth_token` could allow a user to access another user's raw port if they discover the port number. → Mitigation: bind each child process to `127.0.0.1` only and never expose the dynamic port in the browser or URLs. The gateway is the only path to a child process.
- [Risk] All users run under the same OS account, so filesystem isolation is logical, not kernel-enforced. → Mitigation: keep the gateway and per-user data directories under a single sandbox root and rely on the gateway for enforcement. For stronger isolation, run the gateway under a dedicated account or use OS-level permissions later.
- [Risk] WebSocket proxying can be tricky with headers, framing, and connection lifecycle. → Mitigation: use a well-tested proxy library or Bun's built-in `fetch`/WebSocket support, and write focused tests for the upgrade path.
- [Risk] 10 concurrent OpenCode processes may consume significant memory. → Mitigation: implement idle shutdown and set a reasonable concurrency limit. Monitor resource usage before rolling out to all 10 users.
- [Trade-off] Process-per-user is heavier than a single shared instance. → Accepted because true session/data isolation is a hard requirement and OpenCode does not support multi-user natively.
- [Trade-off] Local username/password auth is less secure than SSO. → Accepted for a local development environment; can be replaced with a company SSO later without changing the gateway architecture.

## Migration Plan

1. Deploy the gateway service in the `aiplatform` repository.
2. Stop the existing shared OpenCode process on port 4096.
3. Configure the list of users and permitted projects in the gateway config.
4. Start the gateway on a new port (e.g., 9090).
5. Have developers access OpenCode through the gateway URL instead of `localhost:4096`.
6. Rollback: stop the gateway and restart the original `opencode web --port 4096` process. No OpenCode data is modified during the rollout.

## Open Questions

- Should the gateway be implemented as a single Bun script or a small Hono/Express service?
- What is the acceptable idle timeout before shutting down a user's OpenCode process?
- Should the gateway support starting a fresh OpenCode process per (user, project) pair, or reuse one process per user and switch projects via OpenCode's `directory` routing?
