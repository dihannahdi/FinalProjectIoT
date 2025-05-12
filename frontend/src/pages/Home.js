import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGameStats, getDeviceStatus } from '../services/gameService';
import { FaGamepad, FaTrophy, FaUserAlt, FaInfoCircle } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [deviceStatus, setDeviceStatus] = useState('unknown');
  const [stats, setStats] = useState({
    totalGames: 0,
    avgScore: 0,
    maxScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch device status and game stats
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get device status
        const statusResponse = await getDeviceStatus();
        setDeviceStatus(statusResponse.data.deviceStatus);
        
        // Get game statistics
        const statsResponse = await getGameStats();
        setStats(statsResponse.data.stats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Simon Says IoT Game
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Test your memory with this classic game powered by IoT technology!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/game" className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg py-3 px-6">
              <FaGamepad className="inline mr-2" />
              Play Now
            </Link>
            <Link to="/leaderboard" className="btn bg-blue-700 hover:bg-blue-800 text-lg py-3 px-6">
              <FaTrophy className="inline mr-2" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaInfoCircle className="mr-2 text-blue-500" />
          Device Status
        </h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex items-center">
            <div 
              className={`w-4 h-4 rounded-full mr-2 ${
                deviceStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <p className="text-lg">
              {deviceStatus === 'connected' 
                ? 'Device is connected and ready to play!' 
                : 'Device is currently offline. Please check the connection.'}
            </p>
          </div>
        )}
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Total Games Played</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalGames}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Average Score</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgScore}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500">Highest Score</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.maxScore}</p>
            )}
          </div>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">How to Play</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Simon will play a sequence of colors/tones on the physical device.</li>
          <li>Watch and listen carefully to remember the pattern.</li>
          <li>After the sequence finishes, repeat the pattern by pressing the corresponding buttons.</li>
          <li>Each successful round adds one more step to the sequence.</li>
          <li>The game continues until you make a mistake or complete all levels.</li>
        </ol>
      </div>

      {/* User Section */}
      {!isAuthenticated ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUserAlt className="mr-2 text-blue-500" />
            Create an Account
          </h2>
          <p className="mb-4">
            Register to track your scores and appear on the leaderboard with your name!
          </p>
          <div className="flex space-x-4">
            <Link to="/register" className="btn btn-primary">Register</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUserAlt className="mr-2 text-blue-500" />
            Welcome Back, {currentUser.name}!
          </h2>
          <p className="mb-4">
            Your high score: <span className="font-bold text-blue-600">{currentUser.highScore}</span>
          </p>
          <div className="flex space-x-4">
            <Link to="/game" className="btn btn-primary">Play Game</Link>
            <Link to="/profile" className="btn btn-secondary">View Profile</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 