# OpenCode Multi-User Gateway

A lightweight local gateway that lets multiple developers share a single OpenCode installation without modifying OpenCode itself. Each user gets an isolated OpenCode process with isolated XDG data directories.

## Features

- Local username/password authentication (fallback mode)
- OIDC authentication via Keycloak with group-based project access
- Per-user project allow-list
- Per-user OpenCode process isolation
- Isolated `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, and `TMPDIR`
- HTTP and WebSocket reverse proxy to the correct user process
- Idle process shutdown to save memory

## Prerequisites

- [Bun](https://bun.sh/) installed
- OpenCode CLI available on `PATH` as `opencode`
- Docker (only when using Keycloak authentication)

## Installation

```bash
cd gateway
bun install
```

## Configuration

Copy the example config and edit it:

```bash
cp config.example.yaml config.yaml
# edit config.yaml
```

Set `sessionSecret` to a random string.

### Local authentication (default fallback)

Add users, their passwords, and the projects they are allowed to open under the `users` section. Keep `oidc.enabled: false`.

### Keycloak authentication

1. Start the included Keycloak server:

```bash
cd ../keycloak
docker compose up -d
```

2. In `config.yaml`, set `oidc.enabled: true` and configure the issuer, client ID, and group-to-project mapping.

3. Restart the gateway. Visiting `/login` will redirect you to Keycloak.

4. Add users to Keycloak groups (e.g., `project-a`) to grant access to the corresponding project directory.

See `../keycloak/README.md` for default admin credentials and user setup.

## Running

### With Keycloak (recommended)

```bash
bun start
```

This command first starts Keycloak in Docker and then starts the gateway. The gateway listens on `http://127.0.0.1:9090` and delegates login to Keycloak.

### Without Keycloak (local auth only)

```bash
bun run src/index.ts
```

Or with a custom config path:

```bash
OPENCODE_GATEWAY_CONFIG=/path/to/config.yaml bun run src/index.ts
```

## Usage

1. Open `http://localhost:9090/login` in a browser.
2. Sign in with your configured username and password.
3. Select a project from the list.
4. The gateway starts an isolated OpenCode process for you and proxies all traffic to it.

## Stopping

Press `Ctrl+C` to shut down the gateway. It will stop all running OpenCode child processes.

## Architecture

```
User Browser ──▶ Gateway (localhost:9090)
                    ├── Login / logout / project list
                    └── Proxy all other traffic to per-user OpenCode child processes
```

Each user process has its own sandbox directory under `~/.opencode-sandbox/users/<username>/`.
