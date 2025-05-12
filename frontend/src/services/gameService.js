import axios from 'axios';

// Start a new game with optional player name
export const startGame = async (playerName = 'Anonymous') => {
  try {
    const response = await axios.post('/api/game/start', { player: playerName });
    return response.data;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

// Stop the current game
export const stopGame = async () => {
  try {
    const response = await axios.post('/api/game/stop');
    return response.data;
  } catch (error) {
    console.error('Error stopping game:', error);
    throw error;
  }
};

// Get the device status
export const getDeviceStatus = async () => {
  try {
    const response = await axios.get('/api/game/status');
    return response.data;
  } catch (error) {
    console.error('Error getting device status:', error);
    throw error;
  }
};

// Get the leaderboard
export const getLeaderboard = async (limit = 10) => {
  try {
    const response = await axios.get(`/api/scores/leaderboard?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Get statistics about the game
export const getGameStats = async () => {
  try {
    const response = await axios.get('/api/scores/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting game stats:', error);
    throw error;
  }
};

// Get scores for a specific player
export const getPlayerScores = async (playerName, limit = 10) => {
  try {
    const response = await axios.get(`/api/scores/player/${playerName}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting player scores:', error);
    throw error;
  }
};

// Get current user's scores (requires authentication)
export const getMyScores = async (limit = 10) => {
  try {
    const response = await axios.get(`/api/scores/me?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user scores:', error);
    throw error;
  }
};

// Submit a score manually (useful for testing)
export const submitScore = async (player, score) => {
  try {
    const response = await axios.post('/api/scores', {
      player,
      score,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}; 