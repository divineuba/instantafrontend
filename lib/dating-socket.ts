import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";

export interface MessageNewEvent {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface MessageReadEvent {
  matchId: string;
  readerId: string;
}

export interface MatchNewEvent {
  matchId: string;
  userAId: string;
  userBId: string;
}

export interface TypingEvent {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: string;
  online: boolean;
}

let socket: Socket | null = null;

/** Lazily creates a single shared, cookie-authenticated connection to the /dating namespace. */
export function getDatingSocket(): Socket {
  if (!socket) {
    socket = io(`${API_BASE_URL}/dating`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
