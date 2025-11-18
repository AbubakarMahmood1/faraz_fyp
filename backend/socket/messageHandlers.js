const Message = require('../models/message.model');
const User = require('../models/user.model');

// Store online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

/**
 * Add user to online users
 */
function addOnlineUser(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
}

/**
 * Remove user from online users
 */
function removeOnlineUser(userId, socketId) {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).delete(socketId);
    if (onlineUsers.get(userId).size === 0) {
      onlineUsers.delete(userId);
    }
  }
}

/**
 * Check if user is online
 */
function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

/**
 * Get all socket IDs for a user
 */
function getUserSockets(userId) {
  return onlineUsers.get(userId) || new Set();
}

/**
 * Get list of online user IDs
 */
function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

/**
 * Socket.io message handlers
 */
module.exports = (io, socket) => {
  const userId = socket.userId;

  // Add user to online users
  addOnlineUser(userId, socket.id);

  // Broadcast user online status to all connections
  io.emit('user_status', {
    userId,
    status: 'online',
    timestamp: new Date(),
  });

  /**
   * Join a conversation room
   * Room name format: conversation_<userId1>_<userId2> (sorted alphabetically)
   */
  socket.on('join_conversation', async (data) => {
    try {
      const { otherUserId } = data;

      if (!otherUserId) {
        return socket.emit('error', { message: 'Other user ID is required' });
      }

      // Create room name (sorted user IDs for consistency)
      const roomName = [userId, otherUserId].sort().join('_');
      socket.join(roomName);

      socket.emit('conversation_joined', {
        roomName,
        otherUserId,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Join conversation error:', err);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  /**
   * Leave a conversation room
   */
  socket.on('leave_conversation', (data) => {
    try {
      const { otherUserId } = data;

      if (!otherUserId) {
        return socket.emit('error', { message: 'Other user ID is required' });
      }

      const roomName = [userId, otherUserId].sort().join('_');
      socket.leave(roomName);

      socket.emit('conversation_left', {
        roomName,
        otherUserId,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Leave conversation error:', err);
      socket.emit('error', { message: 'Failed to leave conversation' });
    }
  });

  /**
   * Send a message
   */
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content, contentType } = data;

      if (!receiverId || !content) {
        return socket.emit('error', { message: 'Receiver ID and content are required' });
      }

      // Verify receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return socket.emit('error', { message: 'Receiver not found' });
      }

      // Create message in database
      const message = await Message.create({
        sender: userId,
        receiver: receiverId,
        content,
        contentType: contentType || 'text',
      });

      // Populate sender info
      await message.populate('sender', 'username email');

      // Emit to sender (confirmation)
      socket.emit('message_sent', {
        messageId: message._id,
        tempId: data.tempId, // Client-side temporary ID for optimistic updates
        message: message.toObject(),
        timestamp: new Date(),
      });

      // Emit to receiver (if online)
      const roomName = [userId, receiverId].sort().join('_');
      socket.to(roomName).emit('new_message', {
        message: message.toObject(),
        timestamp: new Date(),
      });

      // Also emit to all receiver's connected sockets (for notifications)
      const receiverSockets = getUserSockets(receiverId);
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit('message_notification', {
          messageId: message._id,
          senderId: userId,
          senderUsername: socket.user.username,
          content: content.substring(0, 100), // Preview
          timestamp: new Date(),
        });
      });
    } catch (err) {
      console.error('Send message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Mark message as read
   */
  socket.on('mark_read', async (data) => {
    try {
      const { messageId } = data;

      if (!messageId) {
        return socket.emit('error', { message: 'Message ID is required' });
      }

      // Update message
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          receiver: userId,
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        },
        { new: true }
      );

      if (!message) {
        return socket.emit('error', { message: 'Message not found or already read' });
      }

      // Emit to sender (if online)
      const roomName = [userId, message.sender.toString()].sort().join('_');
      socket.to(roomName).emit('message_read', {
        messageId,
        readAt: message.readAt,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Mark read error:', err);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  /**
   * Typing indicator - start
   */
  socket.on('typing_start', (data) => {
    try {
      const { receiverId } = data;

      if (!receiverId) {
        return socket.emit('error', { message: 'Receiver ID is required' });
      }

      const roomName = [userId, receiverId].sort().join('_');
      socket.to(roomName).emit('user_typing', {
        userId,
        username: socket.user.username,
        typing: true,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Typing start error:', err);
    }
  });

  /**
   * Typing indicator - stop
   */
  socket.on('typing_stop', (data) => {
    try {
      const { receiverId } = data;

      if (!receiverId) {
        return socket.emit('error', { message: 'Receiver ID is required' });
      }

      const roomName = [userId, receiverId].sort().join('_');
      socket.to(roomName).emit('user_typing', {
        userId,
        username: socket.user.username,
        typing: false,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Typing stop error:', err);
    }
  });

  /**
   * Get online users
   */
  socket.on('get_online_users', () => {
    try {
      const onlineUserIds = getOnlineUserIds();
      socket.emit('online_users', {
        userIds: onlineUserIds,
        count: onlineUserIds.length,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Get online users error:', err);
      socket.emit('error', { message: 'Failed to get online users' });
    }
  });

  /**
   * Get unread message count
   */
  socket.on('get_unread_count', async () => {
    try {
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        read: false,
      });

      socket.emit('unread_count', {
        count: unreadCount,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Get unread count error:', err);
      socket.emit('error', { message: 'Failed to get unread count' });
    }
  });

  /**
   * Handle disconnect
   */
  socket.on('disconnect', () => {
    // Remove user from online users
    removeOnlineUser(userId, socket.id);

    // If user has no more active sockets, broadcast offline status
    if (!isUserOnline(userId)) {
      io.emit('user_status', {
        userId,
        status: 'offline',
        timestamp: new Date(),
      });
    }
  });
};

// Export helper functions for testing/debugging
module.exports.onlineUsers = onlineUsers;
module.exports.isUserOnline = isUserOnline;
module.exports.getOnlineUserIds = getOnlineUserIds;
