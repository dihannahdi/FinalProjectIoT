import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGameStats, getDeviceStatus } from '../services/gameService';
import { FaGamepad, FaTrophy, FaUserAlt, FaInfoCircle, FaLightbulb, FaBrain, FaChartLine, FaCrown } from 'react-icons/fa';

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
    <div className="space-y-10">
      {/* Hero Section with Animated Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl p-8 md:p-12 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Welcome to Simon Says IoT Game
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Test your memory with this classic game powered by IoT technology!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/game" className="btn bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg text-lg py-3 px-8 rounded-full font-semibold transition-all duration-300">
              <FaGamepad className="inline mr-2" />
              Play Now
            </Link>
            <Link to="/leaderboard" className="btn bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-lg py-3 px-8 rounded-full font-semibold transition-all duration-300">
              <FaTrophy className="inline mr-2" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Device Status with Pulse Animation */}
      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
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
              className={`w-4 h-4 rounded-full mr-3 ${
                deviceStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}
            ></div>
            <p className={`text-lg ${deviceStatus === 'connected' ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {deviceStatus === 'connected' 
                ? 'Device is connected and ready to play!' 
                : 'Device is currently offline. Please check the connection.'}
            </p>
          </div>
        )}
      </div>

      {/* Game Stats with Animated Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Games Played</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalGames}</p>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBrain className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Average Score</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgScore}</p>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCrown className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Highest Score</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.maxScore}</p>
            )}
          </div>
        </div>
      </div>

      {/* How to Play with Icons */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <FaLightbulb className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">How to Play</h2>
        </div>
        <ol className="list-decimal space-y-4 pl-6">
          <li className="text-gray-700 pl-2">Simon will play a sequence of colors/tones on the physical device.</li>
          <li className="text-gray-700 pl-2">Watch and listen carefully to remember the pattern.</li>
          <li className="text-gray-700 pl-2">After the sequence finishes, repeat the pattern by pressing the corresponding buttons.</li>
          <li className="text-gray-700 pl-2">Each successful round adds one more step to the sequence.</li>
          <li className="text-gray-700 pl-2">The game continues until you make a mistake or complete all levels.</li>
        </ol>
      </div>

      {/* User Section with Better Styling */}
      {!isAuthenticated ? (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-xl shadow-lg p-8 border border-indigo-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <FaUserAlt className="text-indigo-600 text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
          </div>
          <p className="mb-6 text-gray-600 text-lg">
            Register to track your scores and appear on the leaderboard with your name!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 text-center">Register</Link>
            <Link to="/login" className="btn border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-lg font-medium transition-all duration-300 text-center">Login</Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-xl shadow-lg p-8 border border-indigo-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <FaUserAlt className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back, {currentUser.name}!</h2>
              <p className="text-indigo-600 font-medium">
                High Score: <span className="font-bold">{currentUser.highScore}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/game" className="btn bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 text-center">
              <FaGamepad className="inline mr-2" />
              Play Game
            </Link>
            <Link to="/profile" className="btn border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-lg font-medium transition-all duration-300 text-center">
              <FaUserAlt className="inline mr-2" />
              View Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 