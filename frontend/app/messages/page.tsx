"use client";

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Send, Search, Circle, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

interface Conversation {
  userId: string;
  username: string;
  email: string;
  lastMessage?: Message;
  unreadCount: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function MessagesPage() {
  const { user, getToken } = useAuth();
  const {
    isConnected,
    onlineUsers,
    unreadCount,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageSent,
    onMessageRead,
    onUserTyping,
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Setup Socket event listeners
  useEffect(() => {
    const unsubscribeNewMessage = onNewMessage((data) => {
      const senderId = data.message.sender._id;

      // Add message to the list if it's from the selected conversation
      if (selectedUserId === senderId) {
        setMessages((prev) => [...prev, data.message]);
        markAsRead(data.message._id);
      }

      // Update conversations
      fetchConversations();
    });

    const unsubscribeMessageSent = onMessageSent((data) => {
      // Add sent message to the list
      setMessages((prev) => [...prev, data.message]);

      // Update conversations
      fetchConversations();
    });

    const unsubscribeMessageRead = onMessageRead((data) => {
      // Update message read status
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, read: true, readAt: data.readAt }
            : msg
        )
      );
    });

    const unsubscribeUserTyping = onUserTyping((data) => {
      if (data.userId === selectedUserId) {
        if (data.typing) {
          setTypingUser(data.username);
        } else {
          setTypingUser(null);
        }
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageSent();
      unsubscribeMessageRead();
      unsubscribeUserTyping();
    };
  }, [selectedUserId, onNewMessage, onMessageSent, onMessageRead, onUserTyping, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join/leave conversation when selection changes
  useEffect(() => {
    if (selectedUserId) {
      joinConversation(selectedUserId);
      fetchMessages(selectedUserId);

      return () => {
        leaveConversation(selectedUserId);
      };
    }
  }, [selectedUserId, joinConversation, leaveConversation]);

  const fetchConversations = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/messages/conversation/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        setMessages(response.data.data.messages);

        // Mark unread messages as read
        response.data.data.messages.forEach((msg: Message) => {
          if (!msg.read && msg.receiver === user?._id) {
            markAsRead(msg._id);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedUserId) return;

    const tempId = `temp_${Date.now()}`;
    sendMessage(selectedUserId, messageInput.trim(), 'text', tempId);
    setMessageInput('');

    // Stop typing indicator
    stopTyping(selectedUserId);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!selectedUserId) return;

    // Start typing indicator
    if (!isTyping) {
      startTyping(selectedUserId);
      setIsTyping(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedUserId);
      setIsTyping(false);
    }, 2000);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/search/users?search=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        setSearchResults(response.data.data.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);
  const isUserOnline = selectedUserId ? onlineUsers.has(selectedUserId) : false;

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Messages</span>
            {isConnected ? (
              <Badge variant="outline" className="text-green-600">
                <Circle className="w-2 h-2 fill-current mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">
                <Circle className="w-2 h-2 fill-current mr-1" />
                Disconnected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-5rem)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-5rem)]">
                {/* Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2 px-2">Search Results</p>
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => selectConversation(user._id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-lg mb-1"
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {onlineUsers.has(user._id) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conversations */}
                {!searchQuery && (
                  <div className="p-2">
                    {conversations.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No conversations yet</p>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.userId}
                          onClick={() => selectConversation(conv.userId)}
                          className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg mb-1 ${
                            selectedUserId === conv.userId
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {conv.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers.has(conv.userId) && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{conv.username}</p>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedUserId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {selectedConversation?.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedConversation?.username}</p>
                      <p className="text-sm text-gray-500">
                        {isUserOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isSent = message.sender._id === user?._id;

                          return (
                            <div
                              key={message._id}
                              className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isSent
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                              >
                                <p className="break-words">{message.content}</p>
                                <div
                                  className={`flex items-center gap-1 mt-1 text-xs ${
                                    isSent ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                                >
                                  <span>
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {isSent && (
                                    <>
                                      {message.read ? (
                                        <CheckCheck className="w-4 h-4" />
                                      ) : (
                                        <Check className="w-4 h-4" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {typingUser && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-sm text-gray-500 italic">
                                {typingUser} is typing...
                              </p>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
