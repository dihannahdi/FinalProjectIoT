const Score = require('../models/scoreModel');
const User = require('../models/userModel');

// Create a new score
exports.createScore = async (req, res) => {
  try {
    const { player, score } = req.body;
    
    // Create score in database
    const newScore = await Score.create({
      player: player || 'Anonymous',
      score: score || 0,
      user: req.user ? req.user.id : null,
      timestamp: new Date()
    });
    
    // If user is authenticated, update their high score if needed
    if (req.user) {
      const user = await User.findById(req.user.id);
      const updated = user.updateHighScore(score);
      
      if (updated) {
        await user.save();
      }
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        score: newScore
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = req.query.limit * 1 || 10;
    
    // Get leaderboard from database
    const leaderboard = await Score.getLeaderboard(limit);
    
    res.status(200).json({
      status: 'success',
      results: leaderboard.length,
      data: {
        leaderboard
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get current user's scores
exports.getMyScores = async (req, res) => {
  try {
    const limit = req.query.limit * 1 || 10;
    
    // Get user's scores from database
    const scores = await Score.getUserScores(req.user.id, limit);
    
    res.status(200).json({
      status: 'success',
      results: scores.length,
      data: {
        scores
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get scores by player name
exports.getScoresByPlayer = async (req, res) => {
  try {
    const { player } = req.params;
    const limit = req.query.limit * 1 || 10;
    
    // Get scores for specified player
    const scores = await Score.find({ player })
      .sort({ score: -1, timestamp: 1 })
      .limit(limit)
      .select('score timestamp');
    
    res.status(200).json({
      status: 'success',
      results: scores.length,
      data: {
        player,
        scores
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Score.aggregate([
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      },
      {
        $project: {
          _id: 0,
          totalGames: 1,
          avgScore: { $round: ['$avgScore', 2] },
          maxScore: 1,
          minScore: 1
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0] || {
          totalGames: 0,
          avgScore: 0,
          maxScore: 0,
          minScore: 0
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 