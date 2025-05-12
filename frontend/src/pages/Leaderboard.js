import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getLeaderboard, getGameStats } from '../services/gameService';
import LeaderboardTable from '../components/LeaderboardTable';
import { FaTrophy, FaGamepad, FaChartLine, FaFilter, FaHistory, FaArrowUp, FaStar, FaSync } from 'react-icons/fa';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  // Fetch leaderboard data - wrapped in useCallback to use in useEffect
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLeaderboard(limit);
      setScores(response.data.leaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
      toast.error('Failed to load leaderboard');
    }
  }, [limit]);

  const fetchGameStats = async () => {
    try {
      const response = await getGameStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchGameStats();
  }, [fetchLeaderboard]);

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border border-blue-100">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <FaTrophy className="text-blue-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See who's topping the charts in Simon Says</p>
        </div>

        {/* Stats Cards with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Games</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaHistory className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">{stats.totalGames}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Average Score</h3>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaChartLine className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.avgScore}</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Highest Score</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaArrowUp className="text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.maxScore}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Lowest Score</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaStar className="text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.minScore}</p>
          </div>
        </div>

        {/* Filters and Controls with better styling */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <FaTrophy className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Top Players</h2>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <FaFilter className="text-gray-500 mr-2" />
              <label htmlFor="limit" className="mr-2 text-gray-700 font-medium">Show:</label>
              <select
                id="limit"
                value={limit}
                onChange={handleLimitChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center"
              disabled={loading}
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable scores={scores} loading={loading} />

        {/* Play Game Button */}
        <div className="text-center mt-10">
          <a 
            href="/game" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
          >
            <FaGamepad className="mr-3" />
            Play Game
          </a>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 