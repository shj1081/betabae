// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    // Connect to the socket server with the 'chat' namespace
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000/chat', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server:', socket?.id);
    });

    socket.on('disconnect', reason => {
      console.warn('⚠️ Disconnected:', reason);
    });
  }

  return socket;
}
