// ============================================================================
// useSocket — Singleton Socket.IO client hook
// Provides reactive connection state and typed event listeners
// ============================================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/socket-types";
import { SOCKET_EVENTS, ROLE_ROOMS } from "@/lib/socket-types";
import type { UserRole } from "@/types";

// ── Socket singleton (survives React re-renders) ──────────────────────────
let globalSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  null;
let connectErrorLogged = false;

function getOrCreateSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (globalSocket?.connected) {
    return globalSocket;
  }

  if (!globalSocket) {
    globalSocket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      timeout: 20000,
      forceNew: false,
    });

    globalSocket.on("connect", () => {
      console.log("[SOCKET] Connected:", globalSocket?.id);
      connectErrorLogged = false; // Reset error flag on successful connect
    });

    globalSocket.on("disconnect", (reason) => {
      // Only log unexpected disconnects
      if (reason !== "io client disconnect") {
        console.log("[SOCKET] Disconnected:", reason);
      }
    });

    globalSocket.on("connect_error", (error) => {
      // Only log once per connection attempt cycle to prevent spam
      if (!connectErrorLogged) {
        console.warn("[SOCKET] Connection error:", error.message);
        connectErrorLogged = true;
      }
    });

    globalSocket.io.on("reconnect_attempt", (attempt) => {
      console.log("[SOCKET] Reconnect attempt:", attempt);
      connectErrorLogged = false;
    });

    globalSocket.io.on("reconnect_failed", () => {
      console.warn("[SOCKET] All reconnect attempts failed");
    });
  }

  return globalSocket;
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(getOrCreateSocket());
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  const socket = socketRef.current;

  // Track connection state
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);

    // Sync initial state
    setIsConnected(socket.connected);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    };
  }, [socket]);

  // Auto-join role room when session is available
  useEffect(() => {
    const role = session?.user?.role as UserRole | undefined;
    if (role && socket.connected && !joinedRoomsRef.current.has(role)) {
      socket.emit(SOCKET_EVENTS.JOIN_ROLE_ROOM, role);
      joinedRoomsRef.current.add(role);
    }

    // On role change, leave old room
    return () => {
      if (role) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROLE_ROOM, role);
        joinedRoomsRef.current.delete(role);
      }
    };
  }, [session?.user?.role, socket]);

  // ── Typed event subscription ──────────────────────────────────────────
  const subscribe = useCallback(
    <T extends keyof ServerToClientEvents>(
      event: T,
      handler: ServerToClientEvents[T]
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket as any).on(event, handler);

      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket as any).off(event, handler);
      };
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    subscribe,
    socketId: socket.id,
  };
}