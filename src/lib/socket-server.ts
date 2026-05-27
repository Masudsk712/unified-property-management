// ============================================================================
// Socket.IO Server — Singleton setup for Next.js API routes
// Handles role-based rooms, broadcasting, and event emission
// ============================================================================

import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket as NetSocket } from "net";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "./socket-types";
import { SOCKET_EVENTS, ROLE_ROOMS } from "./socket-types";
import type { UserRole, Notification, ActivityLog } from "@/types";
import { prisma } from "./prisma";

// ── Type extensions for Next.js response ──────────────────────────────────
export interface SocketServer extends NetServer {
  io?: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

// ── Global singleton to survive hot-reloads ────────────────────────────────
const globalForSocket = globalThis as unknown as {
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | undefined;
};

export function getSocketServer(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> | null {
  return globalForSocket.io ?? null;
}

// ── Initialize Socket.IO ───────────────────────────────────────────────────
export function initSocketServer(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> {
  if (globalForSocket.io) {
    return globalForSocket.io;
  }

  // We need a minimal HTTP server for Socket.IO attachment.
  // This will be bound during the first API call via response.socket.server.
  const dummyServer = new NetServer();
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    dummyServer,
    {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["polling", "websocket"],
      pingTimeout: 60000,
      pingInterval: 25000,
    }
  );

  io.on("connection", async (socket) => {
    console.log("[SOCKET.IO] Client connected:", socket.id);

    // ── Role-based room join/leave ───────────────────────────────────────
    socket.on(SOCKET_EVENTS.JOIN_ROLE_ROOM, (role: UserRole) => {
      const room = ROLE_ROOMS[role];
      if (room) {
        socket.join(room);
        console.log(`[SOCKET.IO] ${socket.id} joined room: ${room}`);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROLE_ROOM, (role: UserRole) => {
      const room = ROLE_ROOMS[role];
      if (room) {
        socket.leave(room);
        console.log(`[SOCKET.IO] ${socket.id} left room: ${room}`);
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("[SOCKET.IO] Client disconnected:", socket.id);
    });
  });

  globalForSocket.io = io;
  return io;
}

// ── Attach Socket.IO to an existing HTTP server ────────────────────────────
export function attachSocketToServer(
  res: { socket: { server: SocketServer } }
): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  const { server } = res.socket as unknown as SocketWithIO;

  // If already attached, return existing instance
  if (server.io) {
    return server.io;
  }

  // Initialize and attach
  const io = initSocketServer();
  server.io = io;

  // Re-attach to the actual Next.js HTTP server
  io.attach(server as unknown as NetServer);

  console.log("[SOCKET.IO] Attached to Next.js HTTP server");
  return io;
}

// ── Broadcast helpers ──────────────────────────────────────────────────────

/**
 * Emit a maintenance-related event to all connected clients.
 */
export function emitMaintenanceEvent(
  event: typeof SOCKET_EVENTS.MAINTENANCE_CREATED | typeof SOCKET_EVENTS.MAINTENANCE_UPDATED | typeof SOCKET_EVENTS.MAINTENANCE_RESOLVED,
  data: Parameters<ServerToClientEvents[typeof event]>[0]
) {
  const io = getSocketServer();
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Emit a booking-related event to all connected clients.
 */
export function emitBookingEvent(
  event: typeof SOCKET_EVENTS.BOOKING_CREATED | typeof SOCKET_EVENTS.BOOKING_UPDATED | typeof SOCKET_EVENTS.BOOKING_CANCELLED,
  data: Parameters<ServerToClientEvents[typeof event]>[0]
) {
  const io = getSocketServer();
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Send a real-time notification to a specific user and persist it.
 */
export async function sendRealTimeNotification(
  userId: string,
  notification: Omit<Notification, "id" | "createdAt">
) {
  // Persist to database
  const saved = await prisma.notification.create({
    data: {
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      link: notification.link ?? null,
    },
  });

  // Broadcast via Socket.IO
  const io = getSocketServer();
  if (io) {
    io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
      id: saved.id,
      userId: saved.userId,
      title: saved.title,
      message: saved.message,
      type: saved.type,
      read: saved.read,
      link: saved.link,
      createdAt: saved.createdAt,
    } as Notification);
  }

  return saved;
}

/**
 * Broadcast a new activity log entry to all connected clients.
 */
export async function broadcastActivity(activity: Omit<ActivityLog, "id" | "createdAt">) {
  // Persist to database
  const saved = await prisma.activityLog.create({
    data: {
      userId: activity.userId,
      userName: activity.userName,
      userAvatar: activity.userAvatar ?? null,
      action: activity.action,
      target: activity.target,
      type: activity.type,
    },
  });

  // Broadcast via Socket.IO
  const io = getSocketServer();
  if (io) {
    io.emit(SOCKET_EVENTS.ACTIVITY_NEW, {
      id: saved.id,
      userId: saved.userId,
      userName: saved.userName,
      userAvatar: saved.userAvatar,
      action: saved.action,
      target: saved.target,
      type: saved.type,
      createdAt: saved.createdAt,
    } as ActivityLog);
  }

  return saved;
}

/**
 * Trigger a dashboard refresh for all connected clients.
 */
export function refreshDashboard(data: Parameters<ServerToClientEvents[typeof SOCKET_EVENTS.DASHBOARD_REFRESH]>[0]) {
  const io = getSocketServer();
  if (io) {
    io.emit(SOCKET_EVENTS.DASHBOARD_REFRESH, data);
  }
}

/**
 * Emit an event to a specific role-based room.
 */
export function emitToRole(
  role: UserRole,
  event: keyof ServerToClientEvents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  const io = getSocketServer();
  if (io) {
    const room = ROLE_ROOMS[role];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (io.to(room) as any).emit(event, data);
  }
}

/**
 * Emit an event to all connected clients (same as io.emit).
 */
export function emitToAll(
  event: keyof ServerToClientEvents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  const io = getSocketServer();
  if (io) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (io as any).emit(event, data);
  }
}
