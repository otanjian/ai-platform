import type { ServerWebSocket } from "bun"

export type WebSocketData = {
  targetUrl: string
  backend?: WebSocket
}

export async function proxyHttp(
  request: Request,
  targetUrl: URL,
  publicHost: string,
): Promise<Response> {
  const headers = new Headers(request.headers)
  headers.set("host", targetUrl.host)
  headers.delete("accept-encoding")

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-encoding")

  const location = responseHeaders.get("location")
  if (location) {
    try {
      const locationUrl = new URL(location, targetUrl.toString())
      if (locationUrl.host === targetUrl.host) {
        locationUrl.host = publicHost
        locationUrl.protocol = request.headers.get("x-forwarded-proto") === "https" ? "https:" : "http:"
        responseHeaders.set("location", locationUrl.toString())
      }
    } catch {
      // leave malformed location unchanged
    }
  }

  const contentType = responseHeaders.get("content-type") || ""
  const isText =
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("html") ||
    contentType.includes("text")

  if (isText) {
    const text = await response.text()
    const rewritten = rewriteBackendUrls(text, targetUrl.host, publicHost)
    responseHeaders.set("content-length", String(new TextEncoder().encode(rewritten).length))
    return new Response(rewritten, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export function relayWebSocket(client: ServerWebSocket<WebSocketData>): void {
  const targetUrl = client.data.targetUrl.replace(/^http/, "ws")
  const backend = new WebSocket(targetUrl)

  backend.addEventListener("open", () => {
    client.data = { ...client.data, backend }
  })

  backend.addEventListener("message", (event) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(event.data)
    }
  })

  backend.addEventListener("close", () => {
    if (client.readyState === WebSocket.OPEN) {
      client.close()
    }
  })

  backend.addEventListener("error", (err) => {
    console.error("Backend WebSocket error:", err)
    if (client.readyState === WebSocket.OPEN) {
      client.close()
    }
  })
}

export function forwardToBackend(client: ServerWebSocket<WebSocketData>, message: string | Buffer): void {
  const backend = client.data.backend
  if (backend && backend.readyState === WebSocket.OPEN) {
    backend.send(message)
  }
}

export function closeBackend(client: ServerWebSocket<WebSocketData>): void {
  const backend = client.data.backend
  if (backend && backend.readyState === WebSocket.OPEN) {
    backend.close()
  }
}

function rewriteBackendUrls(text: string, backendHost: string, publicHost: string): string {
  // Rewrite any URL that points to the backend child process or the original 4096 port
  // so it goes through the gateway.
  const escapedBackendHost = backendHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const legacyHosts = ["localhost:4096", "127.0.0.1:4096"]

  let result = text

  for (const host of legacyHosts) {
    const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result
      .replace(new RegExp(`http://(${escaped})\\b`, "g"), `http://${publicHost}`)
      .replace(new RegExp(`https://(${escaped})\\b`, "g"), `https://${publicHost}`)
      .replace(new RegExp(`ws://(${escaped})\\b`, "g"), `ws://${publicHost}`)
      .replace(new RegExp(`wss://(${escaped})\\b`, "g"), `wss://${publicHost}`)
  }

  const httpReplacer = new RegExp(`http://(${escapedBackendHost})\\b`, "g")
  const httpsReplacer = new RegExp(`https://(${escapedBackendHost})\\b`, "g")
  const wsReplacer = new RegExp(`ws://(${escapedBackendHost})\\b`, "g")
  const wssReplacer = new RegExp(`wss://(${escapedBackendHost})\\b`, "g")

  return result
    .replace(httpReplacer, `http://${publicHost}`)
    .replace(httpsReplacer, `https://${publicHost}`)
    .replace(wsReplacer, `ws://${publicHost}`)
    .replace(wssReplacer, `wss://${publicHost}`)
}
