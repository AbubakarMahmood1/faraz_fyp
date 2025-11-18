const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'accepted', // Auto-accept for now, can change to 'pending' for approval system
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connections
connectionSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for faster queries
connectionSchema.index({ follower: 1 });
connectionSchema.index({ following: 1 });
connectionSchema.index({ status: 1 });

const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;
