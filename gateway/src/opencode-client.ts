export type OpenCodeSession = {
  id: string
  title?: string
  directory?: string
  location?: { directory?: string }
  time?: { created?: number; updated?: number }
}

function authHeaders(password?: string): HeadersInit {
  if (!password) return {}
  return { Authorization: `Basic ${btoa(`server:${password}`)}` }
}

function sessionDirectory(session: OpenCodeSession): string | undefined {
  return session.directory || session.location?.directory
}

export function buildOpenCodeSessionEmbedUrl(baseUrl: string, sessionId: string): string {
  const origin = baseUrl.replace(/\/$/, "")
  const serverKey = Buffer.from(origin).toString("base64")
  return `${origin}/server/${serverKey}/session/${sessionId}`
}

export async function listOpenCodeSessions(
  baseUrl: string,
  password: string | undefined,
  directory: string
): Promise<OpenCodeSession[]> {
  const origin = baseUrl.replace(/\/$/, "")
  const url = new URL(`${origin}/session`)
  url.searchParams.set("directory", directory)
  const res = await fetch(url.toString(), {
    headers: authHeaders(password),
  })
  if (!res.ok) {
    throw new Error(`OpenCode list sessions failed: ${res.status}`)
  }
  const data = (await res.json()) as OpenCodeSession[] | { data?: OpenCodeSession[] }
  const list = Array.isArray(data) ? data : data.data || []
  const normalizedDir = directory.replace(/\/$/, "")
  return list
    .filter((s) => {
      const dir = sessionDirectory(s)?.replace(/\/$/, "")
      return !dir || dir === normalizedDir
    })
    .sort((a, b) => (a.time?.created || 0) - (b.time?.created || 0))
}

export async function createOpenCodeSession(
  baseUrl: string,
  password: string | undefined,
  directory: string,
  title?: string
): Promise<OpenCodeSession> {
  const origin = baseUrl.replace(/\/$/, "")
  const res = await fetch(`${origin}/api/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(password),
    },
    body: JSON.stringify({
      title: title || undefined,
      location: { directory },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenCode create session failed: ${res.status} ${text}`)
  }
  const json = (await res.json()) as OpenCodeSession | { data?: OpenCodeSession }
  const session = "data" in json && json.data ? json.data : (json as OpenCodeSession)
  if (!session?.id) {
    throw new Error("OpenCode create session returned empty id")
  }
  return session
}

export type SessionFileDiff = {
  file?: string
  patch?: string
  additions: number
  deletions: number
  status?: "added" | "deleted" | "modified" | string
}

export type SessionCommandResult = {
  info?: unknown
  parts?: Array<{ type?: string; text?: string; [key: string]: unknown }>
}

function withDirectory(url: URL, directory?: string) {
  if (directory) url.searchParams.set("directory", directory)
}

export async function runSessionCommand(
  baseUrl: string,
  password: string | undefined,
  sessionId: string,
  command: string,
  argumentsText?: string,
  directory?: string
): Promise<SessionCommandResult> {
  const origin = baseUrl.replace(/\/$/, "")
  const url = new URL(`${origin}/session/${encodeURIComponent(sessionId)}/command`)
  withDirectory(url, directory)
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(password),
    },
    body: JSON.stringify({
      command,
      arguments: argumentsText || "",
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenCode command failed: ${res.status} ${text}`)
  }
  return (await res.json()) as SessionCommandResult
}

export async function getSessionDiff(
  baseUrl: string,
  password: string | undefined,
  sessionId: string,
  directory?: string
): Promise<SessionFileDiff[]> {
  const origin = baseUrl.replace(/\/$/, "")
  const url = new URL(`${origin}/session/${encodeURIComponent(sessionId)}/diff`)
  withDirectory(url, directory)
  const res = await fetch(url.toString(), {
    headers: authHeaders(password),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenCode session diff failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as SessionFileDiff[] | { data?: SessionFileDiff[] }
  return Array.isArray(data) ? data : data.data || []
}

export async function getVcsDiff(
  baseUrl: string,
  password: string | undefined,
  directory: string,
  mode: "git" | "branch" = "git"
): Promise<SessionFileDiff[]> {
  const origin = baseUrl.replace(/\/$/, "")
  const url = new URL(`${origin}/vcs/diff`)
  url.searchParams.set("mode", mode)
  withDirectory(url, directory)
  const res = await fetch(url.toString(), {
    headers: authHeaders(password),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenCode vcs diff failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as SessionFileDiff[] | { data?: SessionFileDiff[] }
  return Array.isArray(data) ? data : data.data || []
}
