// ============================================================================
// Socket.IO API Route — Next.js App Router endpoint for WebSocket connections
// Bootstraps Socket.IO server on first request and attaches to HTTP server
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import type { SocketServer, SocketWithIO } from "@/lib/socket-server";
import { initSocketServer } from "@/lib/socket-server";

// Global reference to detect first initialization
let initialized = false;

export async function GET(req: NextRequest) {
  try {
    // Bootstrap Socket.IO server on the first request
    if (!initialized) {
      const { socket } = (req as any).socket as any;
      if (socket?.server) {
        const server = socket.server as SocketServer;

        if (!server.io) {
          const io = initSocketServer();
          server.io = io;
          io.attach(server as any);
          console.log("[SOCKET.IO] Attached to Next.js server via API route");
        }

        initialized = true;
      }
    }

    return NextResponse.json({
      status: "ok",
      message: "Socket.IO endpoint active",
    });
  } catch (error) {
    console.error("[SOCKET.IO] Initialization error:", error);
    return NextResponse.json(
      { status: "error", message: "Socket.IO initialization failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

export const dynamic = "force-dynamic";