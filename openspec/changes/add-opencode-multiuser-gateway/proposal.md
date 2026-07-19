## Why

OpenCode running at `http://127.0.0.1:4096/` is a single-user local application. All sessions, configuration, and state share the same XDG directories on the host machine. In our local development environment, up to 10 developers need to access the same OpenCode instance without interfering with each other's sessions, while only being able to open projects they are assigned to. We cannot modify OpenCode itself, so we need an external wrapper that provides multi-user authentication, session isolation, and project-level access control.

## What Changes

- Add a lightweight gateway service in the `aiplatform` repository that sits in front of OpenCode.
- Implement local user authentication and session management for up to 10 users.
- Add a user-to-project mapping that controls which projects each user can open.
- Launch per-user OpenCode child processes with isolated XDG data directories.
- Proxy HTTP and WebSocket traffic from the gateway to the correct user-owned OpenCode instance.
- Do not modify OpenCode source code or internals; rely only on environment variables and CLI arguments.

## Capabilities

### New Capabilities
- `user-auth`: Local user login and session management for the gateway.
- `project-access-control`: Multi-to-many mapping between users and permitted project directories.
- `opencode-process-isolation`: Launch and manage per-user OpenCode child processes with isolated data directories.
- `http-websocket-gateway`: Reverse proxy HTTP and WebSocket traffic to the correct user OpenCode instance.

### Modified Capabilities
- No existing capabilities are modified.

## Impact

- Introduces a new gateway service in the `aiplatform` repository.
- Does not change OpenCode code or behavior; OpenCode is launched as an external child process.
- Adds a dependency on a process manager and reverse proxy implementation (Node.js/Bun based).
- Requires a small amount of disk space for per-user XDG directories and a configuration file for user-project permissions.
