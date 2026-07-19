## ADDED Requirements

### Requirement: Each user has an isolated OpenCode data directory
The gateway SHALL launch each user's OpenCode process with a unique set of XDG environment variables pointing to user-specific directories.

#### Scenario: Launching a user process
- **WHEN** the gateway starts an OpenCode process for a user
- **THEN** the process environment includes `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, and `TMPDIR` set to that user's sandbox directory
- **AND** the directories are created if they do not exist

### Requirement: Each user's OpenCode process is bound to a unique local port
The gateway SHALL assign a dynamic port on `127.0.0.1` to each active user process and keep a mapping of user to port.

#### Scenario: User opens a project
- **WHEN** the gateway launches an OpenCode process for a user
- **THEN** the process listens on an available port on `127.0.0.1`
- **AND** the gateway records the port for that user

### Requirement: User processes are restarted after idle shutdown
The gateway SHALL terminate an OpenCode process after a configurable idle period and restart it transparently on the next request.

#### Scenario: Idle timeout
- **WHEN** a user's OpenCode process has had no traffic for the configured idle timeout
- **THEN** the gateway terminates the process
- **AND** frees the assigned port

#### Scenario: Reconnect after shutdown
- **WHEN** the user makes a new request after their process was shut down
- **THEN** the gateway starts a new OpenCode process for the user
- **AND** routes the request to the new process

### Requirement: User processes do not share state with other users
The gateway SHALL ensure that two users' OpenCode processes use different XDG directories and ports.

#### Scenario: Two active users
- **WHEN** user A and user B both have active OpenCode processes
- **THEN** their `XDG_DATA_HOME` directories are different
- **AND** their listening ports are different
