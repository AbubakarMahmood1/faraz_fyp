const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 }); // For unread messages
messageSchema.index({ createdAt: -1 });

// Virtual for conversation ID (useful for grouping messages)
messageSchema.virtual('conversationId').get(function () {
  const ids = [this.sender.toString(), this.receiver.toString()].sort();
  return ids.join('_');
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
