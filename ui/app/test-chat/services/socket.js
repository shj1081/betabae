import { io } from 'socket.io-client';
import { Platform } from 'react-native';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.reconnectTimer = null;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }
    
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;

    // Use appropriate host based on platform
    const host = Platform.OS === 'web' ? 'http://localhost:3000/chat' : 'http://10.0.2.2:3000/chat';
    
    // Connect to the chat namespace
    // Configure socket options
    const options = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      timeout: 10000, // 10 seconds connection timeout,
      withCredentials: true, // Always use withCredentials to send cookies
      extraHeaders: {
        // Add any additional headers needed for authentication
      }
    };
    
    this.socket = io(host, options);

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Re-register all event listeners after reconnection
      this.reattachListeners();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // If the disconnection was not initiated by the client, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.attemptReconnect();
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnect attempt ${attemptNumber}`);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after max attempts');
      this.attemptReconnect();
    });
  }

  // Disconnect socket
  disconnect() {
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      // Remove all listeners before disconnecting
      this.removeListeners();
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected by client');
    }
  }
  
  // Attempt to reconnect after connection failure
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnected) {
        console.log('Reconnecting...');
        this.disconnect();
        this.connect();
      }
    }, this.reconnectInterval * this.reconnectAttempts); // Exponential backoff
  }
  
  // Reattach all listeners after reconnection
  reattachListeners() {
    Object.entries(this.listeners).forEach(([event, callback]) => {
      if (this.socket) {
        console.log(`Reattaching listener for event: ${event}`);
        this.socket.on(event, callback);
      }
    });
  }

  // Join a chat room
  joinRoom(conversationId) {
    if (!this.checkConnection()) {
      console.error('Socket not connected, attempting to reconnect');
      return Promise.reject('Socket not connected, attempting to reconnect');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { conversationId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.message);
        }
      });
    });
  }

  // Leave a chat room
  leaveRoom(conversationId) {
    if (!this.checkConnection()) {
      console.error('Socket not connected, attempting to reconnect');
      return Promise.reject('Socket not connected, attempting to reconnect');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('leaveRoom', { conversationId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.message);
        }
      });
    });
  }

  // Send a text message
  sendMessage(conversationId, messageText) {
    if (!this.checkConnection()) {
      console.error('Socket not connected, attempting to reconnect');
      return Promise.reject('Socket not connected, attempting to reconnect');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        'sendMessage',
        { conversationId, messageText },
        (response) => {
          if (response.success) {
            resolve(response.message);
          } else {
            reject(response.message);
          }
        }
      );
    });
  }

  // Listen for new messages in a conversation
  onNewMessage(callback) {
    if (!this.checkConnection()) {
      console.error('Socket not connected, attempting to reconnect');
      return;
    }

    this.socket.on('newMessage', callback);
    this.listeners['newMessage'] = callback;
  }

  // Listen for message notifications (when not in the conversation)
  onMessageNotification(callback) {
    if (!this.checkConnection()) {
      console.error('Socket not connected, attempting to reconnect');
      return;
    }

    this.socket.on('messageNotification', callback);
    this.listeners['messageNotification'] = callback;
  }

  // Remove event listeners
  removeListeners() {
    if (!this.socket) return;
    
    Object.keys(this.listeners).forEach(event => {
      console.log(`Removing listener for event: ${event}`);
      this.socket.off(event, this.listeners[event]);
    });
    
    // Clear the listeners object after removing all listeners
    this.listeners = {};
  }
  
  // Remove a specific event listener
  removeListener(event, callback) {
    if (!this.socket) return;
    
    console.log(`Removing specific listener for event: ${event}`);
    this.socket.off(event, callback);
    
    // Remove from our listeners object if it matches
    if (this.listeners[event] === callback) {
      delete this.listeners[event];
    }
  }
  
  // Check connection status and reconnect if needed
  checkConnection() {
    if (!this.isConnected && !this.reconnectTimer) {
      console.log('Connection check failed, attempting to reconnect...');
      this.connect();
      return false;
    }
    return this.isConnected;
  }
  
  // Get the current user ID from the socket connection
  // This is useful because the socket connection has the user ID from the session
  getCurrentUserId() {
    return new Promise((resolve, reject) => {
      if (!this.checkConnection()) {
        console.error('Socket not connected, cannot get user ID');
        return reject('Socket not connected');
      }
      
      // Emit a custom event to get the user ID
      this.socket.emit('getUserId', {}, (response) => {
        if (response.success) {
          console.log('Got user ID from socket:', response.userId);
          resolve(response.userId);
        } else {
          console.error('Failed to get user ID:', response.message);
          reject(response.message);
        }
      });
    });
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
