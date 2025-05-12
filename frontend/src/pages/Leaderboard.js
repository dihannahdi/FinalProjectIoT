import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getLeaderboard, getGameStats } from '../services/gameService';
import LeaderboardTable from '../components/LeaderboardTable';
import { FaTrophy, FaGamepad, FaChartLine } from 'react-icons/fa';

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

  useEffect(() => {
    fetchLeaderboard();
    fetchGameStats();
  }, [limit]);

  const fetchLeaderboard = async () => {
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
  };

  const fetchGameStats = async () => {
    try {
      const response = await getGameStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" />
          Leaderboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Total Games</p>
            <p className="text-xl font-bold">{stats.totalGames}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-xl font-bold">{stats.avgScore}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Highest Score</p>
            <p className="text-xl font-bold">{stats.maxScore}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Lowest Score</p>
            <p className="text-xl font-bold">{stats.minScore}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold mb-4 md:mb-0 flex items-center">
            <FaChartLine className="text-blue-500 mr-2" />
            Top Players
          </h2>
          <div className="flex items-center">
            <label htmlFor="limit" className="mr-2">Show:</label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="form-control w-auto"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
            <button
              onClick={fetchLeaderboard}
              className="btn btn-primary ml-2"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable scores={scores} loading={loading} />

        {/* Play Game Button */}
        <div className="text-center mt-8">
          <a href="/game" className="btn btn-success inline-flex items-center">
            <FaGamepad className="mr-2" />
            Play Game
          </a>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 