const port = Number(process.argv[process.argv.length - 1])
Bun.serve({
  port,
  hostname: "127.0.0.1",
  fetch() {
    return new Response("mock-opencode")
  },
  websocket: {
    open(ws) {
      ws.send("mock-ws")
    },
    message(ws, message) {
      ws.send(message)
    },
    close() {},
  },
})
