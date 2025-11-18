const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'profile_completed',
        'profile_updated',
        'connection_made',
        'post_created',
        'comment_added',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Flexible for different activity types
    },
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ visibility: 1 });
activitySchema.index({ createdAt: -1 }); // For chronological feed

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
