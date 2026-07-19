## 1. Project Setup

- [x] 1.1 Initialize a Bun/Node.js service in the `aiplatform` repository for the gateway
- [x] 1.2 Add required dependencies (HTTP server, password hashing, YAML config parser, proxy/WebSocket support)
- [x] 1.3 Add a `README.md` with how to run the gateway locally

## 2. Configuration and User Data Model

- [x] 2.1 Create a YAML configuration schema for users and their permitted projects
- [x] 2.2 Load and validate the configuration at startup
- [x] 2.3 Create a helper to resolve per-user sandbox XDG directories

## 3. User Authentication

- [x] 3.1 Implement a login endpoint that validates username and password against the config
- [x] 3.2 Implement a session cookie mechanism for authenticated users
- [x] 3.3 Implement a logout endpoint that clears the session
- [x] 3.4 Add middleware to protect all gateway routes behind the session

## 4. Project Access Control

- [x] 4.1 Implement a project list endpoint that returns only the user's permitted projects
- [x] 4.2 Implement an "open project" endpoint that checks user-project permissions before proceeding
- [x] 4.3 Validate that the requested project path exists and is a directory
- [x] 4.4 Return 403 for projects not assigned to the user and 400 for invalid paths

## 5. OpenCode Process Isolation

- [x] 5.1 Implement a process manager that starts an OpenCode child process per user
- [x] 5.2 Assign a unique dynamic port on `127.0.0.1` for each user process
- [x] 5.3 Set isolated `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, and `TMPDIR` for each process
- [x] 5.4 Implement idle shutdown of user processes after a configurable timeout
- [x] 5.5 Implement transparent restart of a user process on the next request after shutdown

## 6. HTTP and WebSocket Proxy

- [x] 6.1 Implement HTTP reverse proxy from the gateway to the correct user OpenCode process
- [x] 6.2 Implement WebSocket upgrade forwarding and bidirectional relay
- [x] 6.3 Ensure child process ports are never exposed to the browser or in URLs
- [x] 6.4 Return 503 if the OpenCode process fails to start or crashes

## 7. UI and Developer Experience

- [x] 7.1 Create a simple login page
- [x] 7.2 Create a project selection page
- [x] 7.3 Embed the OpenCode UI behind the gateway after a project is opened

## 8. Verification and Deployment

- [x] 8.1 Write manual or automated tests for login, project access, and proxying
- [x] 8.2 Verify that two users cannot see each other's sessions or data
- [x] 8.3 Update local team documentation to use the gateway URL instead of `localhost:4096`
- [x] 8.4 Stop the original shared `opencode web --port 4096` process and start the gateway on port 9090

## 9. User and Project Management (Gateway-only)

- [x] 9.1 Add JSON-based user store for runtime user/project persistence
- [x] 9.2 Add `adminUsers` configuration for admin access control
- [x] 9.3 Create admin panel UI at `/admin`
- [x] 9.4 Add admin API endpoints for user CRUD and project assignment
- [x] 9.5 Add admin API endpoints for global project pool management
- [x] 9.6 Write tests for user store and admin flows
- [x] 9.7 Verify that newly created users can log in and access assigned projects
