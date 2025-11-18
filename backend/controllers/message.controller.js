const Message = require('../models/message.model');
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const errorMessages = require('../utils/errorMessages');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        status: 'fail',
        message: 'Receiver and message content are required',
      });
    }

    // Can't message yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot send a message to yourself',
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: 'fail',
        message: errorMessages.user.notFound,
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    // Populate sender info
    await message.populate('sender', 'username registerAs');

    res.status(201).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'username registerAs')
      .populate('receiver', 'username registerAs')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 }); // Most recent first

    // Mark messages from the other user as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    // Get profiles for both users
    const profiles = await Profile.find({
      user: { $in: [currentUserId, userId] },
    }).select('user firstName lastName profileImage');

    const enrichedMessages = messages.map((msg) => {
      const senderProfile = profiles.find(
        (p) => p.user.toString() === msg.sender._id.toString()
      );
      const receiverProfile = profiles.find(
        (p) => p.user.toString() === msg.receiver._id.toString()
      );

      return {
        _id: msg._id,
        content: msg.content,
        read: msg.read,
        readAt: msg.readAt,
        createdAt: msg.createdAt,
        sender: {
          _id: msg.sender._id,
          username: msg.sender.username,
          role: msg.sender.registerAs,
          firstName: senderProfile?.firstName,
          lastName: senderProfile?.lastName,
          profileImage: senderProfile?.profileImage,
        },
        receiver: {
          _id: msg.receiver._id,
          username: msg.receiver.username,
          role: msg.receiver.registerAs,
          firstName: receiverProfile?.firstName,
          lastName: receiverProfile?.lastName,
          profileImage: receiverProfile?.profileImage,
        },
      };
    });

    res.status(200).json({
      status: 'success',
      results: enrichedMessages.length,
      data: {
        messages: enrichedMessages.reverse(), // Oldest first for display
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get unique users the current user has messaged with
    const sentMessages = await Message.find({ sender: currentUserId })
      .distinct('receiver');

    const receivedMessages = await Message.find({ receiver: currentUserId })
      .distinct('sender');

    // Combine and get unique user IDs
    const allUserIds = [...new Set([...sentMessages, ...receivedMessages])];

    // Get latest message for each conversation
    const conversations = await Promise.all(
      allUserIds.map(async (userId) => {
        const latestMessage = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: userId },
            { sender: userId, receiver: currentUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'username registerAs')
          .populate('receiver', 'username registerAs');

        // Count unread messages from this user
        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: currentUserId,
          read: false,
        });

        return {
          userId,
          latestMessage,
          unreadCount,
        };
      })
    );

    // Get profiles for all users
    const profiles = await Profile.find({
      user: { $in: allUserIds },
    }).select('user firstName lastName profileImage');

    // Enrich conversations
    const enrichedConversations = conversations
      .filter((conv) => conv.latestMessage) // Only include conversations with messages
      .map((conv) => {
        const profile = profiles.find(
          (p) => p.user.toString() === conv.userId.toString()
        );

        const otherUser =
          conv.latestMessage.sender._id.toString() === currentUserId.toString()
            ? conv.latestMessage.receiver
            : conv.latestMessage.sender;

        return {
          userId: conv.userId,
          username: otherUser.username,
          role: otherUser.registerAs,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          profileImage: profile?.profileImage,
          latestMessage: {
            content: conv.latestMessage.content,
            createdAt: conv.latestMessage.createdAt,
            isSent: conv.latestMessage.sender._id.toString() === currentUserId.toString(),
          },
          unreadCount: conv.unreadCount,
        };
      })
      .sort((a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt); // Most recent first

    res.status(200).json({
      status: 'success',
      results: enrichedConversations.length,
      data: {
        conversations: enrichedConversations,
      },
    });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      read: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount,
      },
    });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      receiver: currentUserId,
    });

    if (!message) {
      return res.status(404).json({
        status: 'fail',
        message: 'Message not found',
      });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({
      status: 'success',
      data: {
        message,
      },
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({
      status: 'error',
      message: errorMessages.server.generic,
    });
  }
};
