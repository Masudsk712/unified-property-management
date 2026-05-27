// ============================================================================
// Custom Server for Socket.IO — Next.js + Socket.IO integration
// Run with: npx tsx server.ts
// This enables real-time WebSocket support alongside Next.js
// ============================================================================

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Initialize and attach Socket.IO
  const io = initSocketServer();
  io.attach(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  httpServer.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use.`);
      process.exit(1);
    }
    throw err;
  });

  httpServer.listen(port, () => {
    console.log(
      `[SERVER] Ready on http://${hostname}:${port} | Socket.IO path: /api/socketio`
    );
  });
});