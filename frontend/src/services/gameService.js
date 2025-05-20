import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Start a new game with optional player name
export const startGame = async (playerName) => {
  try {
    const response = await axios.post(`${API_URL}/game/start`, { playerName });
    return response.data;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

// Stop the current game
export const stopGame = async () => {
  try {
    const response = await axios.post(`${API_URL}/game/stop`);
    return response.data;
  } catch (error) {
    console.error('Error stopping game:', error);
    throw error;
  }
};

// Get the device status
export const getDeviceStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/game/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting device status:', error);
    throw error;
  }
};

// Get the leaderboard
export const getLeaderboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/game/leaderboard`);
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
export const submitScore = async (playerName, score) => {
  try {
    const response = await axios.post(`${API_URL}/game/score`, {
      playerName,
      score,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}; 