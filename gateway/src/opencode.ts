import fs from "fs/promises"
import path from "path"
import os from "os"
import type { GatewayConfig, UserProcess } from "./types"

export class ProcessManager {
  private processes = new Map<string, UserProcess>()
  private idleCheckInterval: Timer | null = null

  constructor(private readonly config: GatewayConfig) {}

  startIdleChecker(): void {
    if (this.idleCheckInterval) return
    this.idleCheckInterval = setInterval(() => this.checkIdle(), 60 * 1000)
  }

  async checkIdleNow(): Promise<void> {
    await this.checkIdle()
  }

  stopIdleChecker(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval)
      this.idleCheckInterval = null
    }
  }

  async getOrStartProcess(username: string, projectPath: string): Promise<UserProcess> {
    const existing = this.processes.get(username)
    if (existing && existing.projectPath === projectPath) {
      existing.lastActivityAt = Date.now()
      return existing
    }

    if (existing) {
      await this.stopProcess(username)
    }

    const port = await this.findFreePort()
    const userDir = this.getUserSandboxDir(username)
    await this.ensureUserDirs(userDir)

    const env = {
      ...process.env,
      XDG_DATA_HOME: path.join(userDir, "data"),
      XDG_CONFIG_HOME: path.join(userDir, "config"),
      XDG_STATE_HOME: path.join(userDir, "state"),
      XDG_CACHE_HOME: path.join(userDir, "cache"),
      TMPDIR: path.join(userDir, "tmp"),
      OPENCODE_CONFIG_DIR: path.join(userDir, "config", "opencode"),
    }

    const args = [...this.config.opencodeArgs, "--port", String(port)]
    const proc = Bun.spawn([this.config.opencodeCommand, ...args], {
      env,
      cwd: projectPath,
      stdout: "inherit",
      stderr: "inherit",
      onExit: () => {
        this.processes.delete(username)
      },
    })

    await this.waitForPort(port)

    const userProcess: UserProcess = {
      username,
      port,
      projectPath,
      process: proc,
      lastActivityAt: Date.now(),
      startedAt: Date.now(),
    }

    this.processes.set(username, userProcess)
    return userProcess
  }

  async stopProcess(username: string): Promise<void> {
    const proc = this.processes.get(username)
    if (!proc) return
    this.processes.delete(username)
    proc.process.kill(15)
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      if (!proc.process.killed) {
        proc.process.kill(9)
      }
    } catch {
      // process may have already exited
    }
  }

  async stopAll(): Promise<void> {
    const usernames = Array.from(this.processes.keys())
    await Promise.all(usernames.map((u) => this.stopProcess(u)))
  }

  getProcess(username: string): UserProcess | undefined {
    const proc = this.processes.get(username)
    if (proc) proc.lastActivityAt = Date.now()
    return proc
  }

  private async checkIdle(): Promise<void> {
    const now = Date.now()
    for (const [username, proc] of this.processes) {
      if (now - proc.lastActivityAt > this.config.idleTimeoutMs) {
        await this.stopProcess(username)
      }
    }
  }

  private async findFreePort(): Promise<number> {
    const server = Bun.listen({
      hostname: "127.0.0.1",
      port: 0,
      socket: {
        data() {},
      },
    })
    const port = server.port
    server.stop()
    return port
  }

  private async waitForPort(port: number, timeoutMs = 30000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const socket = await Bun.connect({
          hostname: "127.0.0.1",
          port,
          socket: {
            data() {},
            open() {},
            close() {},
            drain() {},
            error() {},
          },
        })
        socket.end()
        return
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
    throw new Error(`OpenCode did not start listening on port ${port} within ${timeoutMs}ms`)
  }

  private getUserSandboxDir(username: string): string {
    return path.join(this.config.sandboxRoot, "users", username)
  }

  private async ensureUserDirs(userDir: string): Promise<void> {
    await fs.mkdir(path.join(userDir, "data"), { recursive: true })
    await fs.mkdir(path.join(userDir, "config"), { recursive: true })
    await fs.mkdir(path.join(userDir, "state"), { recursive: true })
    await fs.mkdir(path.join(userDir, "cache"), { recursive: true })
    await fs.mkdir(path.join(userDir, "tmp"), { recursive: true })
  }
}
