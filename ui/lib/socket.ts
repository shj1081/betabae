import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:3000/chat', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', reason => {
      console.warn('⚠️ Socket disconnected:', reason);
    });

    socket.on('connect_error', err => {
      console.error('❌ Connection error:', err.message);
    });
  }

  return socket;
}
