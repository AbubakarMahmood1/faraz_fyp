import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  receiver: string;
  content: string;
  contentType: 'text' | 'image' | 'file' | 'link';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  error: (error: { message: string }) => void;

  // Message events
  message_sent: (data: {
    messageId: string;
    tempId?: string;
    message: Message;
    timestamp: Date;
  }) => void;
  new_message: (data: { message: Message; timestamp: Date }) => void;
  message_notification: (data: {
    messageId: string;
    senderId: string;
    senderUsername: string;
    content: string;
    timestamp: Date;
  }) => void;
  message_read: (data: {
    messageId: string;
    readAt: Date;
    timestamp: Date;
  }) => void;

  // Conversation events
  conversation_joined: (data: {
    roomName: string;
    otherUserId: string;
    timestamp: Date;
  }) => void;
  conversation_left: (data: {
    roomName: string;
    otherUserId: string;
    timestamp: Date;
  }) => void;

  // Typing events
  user_typing: (data: {
    userId: string;
    username: string;
    typing: boolean;
    timestamp: Date;
  }) => void;

  // Status events
  user_status: (data: {
    userId: string;
    status: 'online' | 'offline';
    timestamp: Date;
  }) => void;
  online_users: (data: {
    userIds: string[];
    count: number;
    timestamp: Date;
  }) => void;

  // Unread count
  unread_count: (data: { count: number; timestamp: Date }) => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize socket connection
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupDefaultListeners();
  }

  /**
   * Setup default event listeners
   */
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✓ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join a conversation
   */
  joinConversation(otherUserId: string): void {
    this.emit('join_conversation', { otherUserId });
  }

  /**
   * Leave a conversation
   */
  leaveConversation(otherUserId: string): void {
    this.emit('leave_conversation', { otherUserId });
  }

  /**
   * Send a message
   */
  sendMessage(
    receiverId: string,
    content: string,
    contentType: 'text' | 'image' | 'file' | 'link' = 'text',
    tempId?: string
  ): void {
    this.emit('send_message', {
      receiverId,
      content,
      contentType,
      tempId,
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): void {
    this.emit('mark_read', { messageId });
  }

  /**
   * Start typing indicator
   */
  startTyping(receiverId: string): void {
    this.emit('typing_start', { receiverId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(receiverId: string): void {
    this.emit('typing_stop', { receiverId });
  }

  /**
   * Get online users
   */
  getOnlineUsers(): void {
    this.emit('get_online_users');
  }

  /**
   * Get unread message count
   */
  getUnreadCount(): void {
    this.emit('get_unread_count');
  }

  /**
   * Listen to an event
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event as string, callback as any);

    // Track listener for cleanup
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }
    this.listeners.get(event as string)?.add(callback as Function);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ): void {
    if (!this.socket) return;

    this.socket.off(event as string, callback as any);

    // Remove from tracked listeners
    this.listeners.get(event as string)?.delete(callback as Function);
  }

  /**
   * Emit an event
   */
  private emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
