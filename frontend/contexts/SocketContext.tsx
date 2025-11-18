"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService from '@/lib/socket/socketService';
import { useAuth } from './AuthContext';

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

interface OnlineUser {
  userId: string;
  status: 'online' | 'offline';
}

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: Set<string>;
  unreadCount: number;
  sendMessage: (
    receiverId: string,
    content: string,
    contentType?: 'text' | 'image' | 'file' | 'link',
    tempId?: string
  ) => void;
  joinConversation: (otherUserId: string) => void;
  leaveConversation: (otherUserId: string) => void;
  markAsRead: (messageId: string) => void;
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  getOnlineUsers: () => void;
  getUnreadCount: () => void;
  onNewMessage: (callback: (data: { message: Message; timestamp: Date }) => void) => () => void;
  onMessageSent: (callback: (data: { messageId: string; tempId?: string; message: Message; timestamp: Date }) => void) => () => void;
  onMessageRead: (callback: (data: { messageId: string; readAt: Date; timestamp: Date }) => void) => () => void;
  onUserTyping: (callback: (data: { userId: string; username: string; typing: boolean; timestamp: Date }) => void) => () => void;
  onUserStatus: (callback: (data: { userId: string; status: 'online' | 'offline'; timestamp: Date }) => void) => () => void;
  onMessageNotification: (callback: (data: { messageId: string; senderId: string; senderUsername: string; content: string; timestamp: Date }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const token = getToken();
      if (token) {
        socketService.connect(token);
        setIsConnected(true);

        // Setup listeners
        socketService.on('connect', () => {
          setIsConnected(true);
          // Request initial data
          socketService.getOnlineUsers();
          socketService.getUnreadCount();
        });

        socketService.on('disconnect', () => {
          setIsConnected(false);
        });

        socketService.on('online_users', (data) => {
          setOnlineUsers(new Set(data.userIds));
        });

        socketService.on('unread_count', (data) => {
          setUnreadCount(data.count);
        });

        socketService.on('user_status', (data) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            if (data.status === 'online') {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        });

        // Increment unread count on new message notification
        socketService.on('message_notification', () => {
          setUnreadCount((prev) => prev + 1);
        });

        return () => {
          socketService.disconnect();
          setIsConnected(false);
        };
      }
    } else {
      socketService.disconnect();
      setIsConnected(false);
    }
  }, [isLoggedIn, getToken]);

  // Wrapper functions
  const sendMessage = (
    receiverId: string,
    content: string,
    contentType: 'text' | 'image' | 'file' | 'link' = 'text',
    tempId?: string
  ) => {
    socketService.sendMessage(receiverId, content, contentType, tempId);
  };

  const joinConversation = (otherUserId: string) => {
    socketService.joinConversation(otherUserId);
  };

  const leaveConversation = (otherUserId: string) => {
    socketService.leaveConversation(otherUserId);
  };

  const markAsRead = (messageId: string) => {
    socketService.markAsRead(messageId);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const startTyping = (receiverId: string) => {
    socketService.startTyping(receiverId);
  };

  const stopTyping = (receiverId: string) => {
    socketService.stopTyping(receiverId);
  };

  const getOnlineUsers = () => {
    socketService.getOnlineUsers();
  };

  const getUnreadCount = () => {
    socketService.getUnreadCount();
  };

  // Event listeners that return cleanup functions
  const onNewMessage = (callback: (data: { message: Message; timestamp: Date }) => void) => {
    socketService.on('new_message', callback);
    return () => socketService.off('new_message', callback);
  };

  const onMessageSent = (callback: (data: { messageId: string; tempId?: string; message: Message; timestamp: Date }) => void) => {
    socketService.on('message_sent', callback);
    return () => socketService.off('message_sent', callback);
  };

  const onMessageRead = (callback: (data: { messageId: string; readAt: Date; timestamp: Date }) => void) => {
    socketService.on('message_read', callback);
    return () => socketService.off('message_read', callback);
  };

  const onUserTyping = (callback: (data: { userId: string; username: string; typing: boolean; timestamp: Date }) => void) => {
    socketService.on('user_typing', callback);
    return () => socketService.off('user_typing', callback);
  };

  const onUserStatus = (callback: (data: { userId: string; status: 'online' | 'offline'; timestamp: Date }) => void) => {
    socketService.on('user_status', callback);
    return () => socketService.off('user_status', callback);
  };

  const onMessageNotification = (callback: (data: { messageId: string; senderId: string; senderUsername: string; content: string; timestamp: Date }) => void) => {
    socketService.on('message_notification', callback);
    return () => socketService.off('message_notification', callback);
  };

  const value: SocketContextType = {
    isConnected,
    onlineUsers,
    unreadCount,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    startTyping,
    stopTyping,
    getOnlineUsers,
    getUnreadCount,
    onNewMessage,
    onMessageSent,
    onMessageRead,
    onUserTyping,
    onUserStatus,
    onMessageNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
