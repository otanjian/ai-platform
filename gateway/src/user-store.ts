import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import type { User } from "./types"

export type UserStoreData = {
  users: User[]
  projects: string[]
}

export class UserStore {
  private data: UserStoreData
  private readonly filePath: string

  constructor(filePath: string, initialUsers: User[] = []) {
    this.filePath = filePath
    this.data = {
      users: initialUsers,
      projects: this.extractProjects(initialUsers),
    }
  }

  static async load(filePath: string, initialUsers: User[] = []): Promise<UserStore> {
    const store = new UserStore(filePath, initialUsers)
    await store.ensureDir()
    if (fsSync.existsSync(filePath)) {
      const content = await fs.readFile(filePath, "utf-8")
      const parsed = JSON.parse(content) as Partial<UserStoreData>
      store.data.users = parsed.users || store.data.users
      store.data.projects = parsed.projects || store.extractProjects(store.data.users)
    } else if (initialUsers.length > 0) {
      await store.save()
    }
    return store
  }

  async save(): Promise<void> {
    await this.ensureDir()
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2))
  }

  getUsers(): User[] {
    return this.data.users.map((u) => ({ ...u }))
  }

  getProjects(): string[] {
    return [...this.data.projects]
  }

  getUser(username: string): User | undefined {
    return this.data.users.find((u) => u.username === username)
  }

  async addUser(user: User): Promise<void> {
    if (this.data.users.some((u) => u.username === user.username)) {
      throw new Error(`User ${user.username} already exists`)
    }
    this.data.users.push(user)
    this.addProjects(user.projects)
    await this.save()
  }

  async removeUser(username: string): Promise<void> {
    this.data.users = this.data.users.filter((u) => u.username !== username)
    await this.save()
  }

  async setPassword(username: string, passwordHash: string): Promise<void> {
    const user = this.data.users.find((u) => u.username === username)
    if (!user) throw new Error(`User ${username} not found`)
    user.passwordHash = passwordHash
    await this.save()
  }

  async setUserProjects(username: string, projects: string[]): Promise<void> {
    const user = this.data.users.find((u) => u.username === username)
    if (!user) throw new Error(`User ${username} not found`)
    user.projects = projects
    this.addProjects(projects)
    await this.save()
  }

  async addProject(projectPath: string): Promise<void> {
    if (!this.data.projects.includes(projectPath)) {
      this.data.projects.push(projectPath)
      await this.save()
    }
  }

  async removeProject(projectPath: string): Promise<void> {
    this.data.projects = this.data.projects.filter((p) => p !== projectPath)
    for (const user of this.data.users) {
      user.projects = user.projects.filter((p) => p !== projectPath)
    }
    await this.save()
  }

  private addProjects(projects: string[]): void {
    for (const p of projects) {
      if (!this.data.projects.includes(p)) {
        this.data.projects.push(p)
      }
    }
  }

  private extractProjects(users: User[]): string[] {
    const set = new Set<string>()
    for (const user of users) {
      for (const p of user.projects) {
        set.add(p)
      }
    }
    return Array.from(set)
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
  }
}
