const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  player: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  }
});

// Index for efficient leaderboard queries
scoreSchema.index({ score: -1, timestamp: -1 });

// Static method to get leaderboard
scoreSchema.statics.getLeaderboard = async function(limit = 10) {
  return this.find()
    .sort({ score: -1, timestamp: 1 })
    .limit(limit)
    .select('player score timestamp');
};

// Static method to get user's scores
scoreSchema.statics.getUserScores = async function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ score: -1, timestamp: 1 })
    .limit(limit)
    .select('score timestamp');
};

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score; 