import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { startGame, stopGame, getDeviceStatus, submitScore } from '../services/gameService';
import { FaPlay, FaStop, FaSync, FaExclamationTriangle, FaUser, FaGamepad, FaLightbulb, FaTrophy } from 'react-icons/fa';

const COLORS = ['red', 'green', 'blue', 'yellow'];
const COLOR_NAMES = {
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  yellow: 'Yellow'
};

const Game = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  
  // Check device status
  const checkDeviceStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await getDeviceStatus();
      setDeviceStatus(response.data.deviceStatus);
      setStatusLoading(false);
    } catch (error) {
      console.error('Error checking device status:', error);
      setDeviceStatus('unknown');
      setStatusLoading(false);
      toast.error('Failed to connect to device');
    }
  };
  
  // Start the game
  const handleStartGame = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      await startGame(playerName);
      setIsPlaying(true);
      setScore(0);
      toast.success('Game started! Watch the physical device for patterns.');
      setLoading(false);
      
      // Visual demo effect for the UI
      simulateSequence();
    } catch (error) {
      console.error('Error starting game:', error);
      setLoading(false);
      toast.error('Failed to start game');
    }
  };
  
  // Simulate a sequence for visual feedback (UI only)
  const simulateSequence = () => {
    const demoSequence = [0, 1, 2, 3, 0, 2]; // Just for visual effect
    
    demoSequence.forEach((buttonIndex, i) => {
      setTimeout(() => {
        setActiveButton(buttonIndex);
        setTimeout(() => setActiveButton(null), 300);
      }, i * 500);
    });
  };
  
  // Stop the game - wrapped in useCallback to use in useEffect
  const handleStopGame = useCallback(async () => {
    try {
      setLoading(true);
      await stopGame();
      setIsPlaying(false);
      setLoading(false);
      toast.info('Game stopped');
    } catch (error) {
      console.error('Error stopping game:', error);
      setLoading(false);
      toast.error('Failed to stop game');
    }
  }, []);
  
  // For demo/testing: Submit a mock score
  const handleSubmitScore = async () => {
    try {
      setLoading(true);
      // Generate a random score between 1 and 20
      const mockScore = Math.floor(Math.random() * 20) + 1;
      await submitScore(playerName, mockScore);
      setScore(mockScore);
      setIsPlaying(false);
      setLoading(false);
      toast.success(`Game over! Score: ${mockScore}`);
    } catch (error) {
      console.error('Error submitting score:', error);
      setLoading(false);
      toast.error('Failed to submit score');
    }
  };
  
  // Render game buttons (these are just visual, physical buttons on hardware are used for actual gameplay)
  const renderGameButtons = () => {
    return (
      <div className="grid grid-cols-2 gap-8 max-w-xs mx-auto">
        {COLORS.map((color, index) => (
          <button
            key={index}
            className={`game-button simon-${color} ${activeButton === index ? 'simon-active' : ''} transform transition-all duration-200 shadow-md hover:shadow-lg`}
            disabled={!isPlaying}
            aria-label={`${color} button`}
          >
            <span className="sr-only">{COLOR_NAMES[color]}</span>
          </button>
        ))}
      </div>
    );
  };

  // Get device status on component mount
  useEffect(() => {
    checkDeviceStatus();
    
    // Set player name from current user if authenticated
    if (isAuthenticated && currentUser) {
      setPlayerName(currentUser.name);
    }
    
    // Cleanup function to stop game if component unmounts
    return () => {
      if (isPlaying) {
        handleStopGame();
      }
    };
  }, [isAuthenticated, currentUser, isPlaying, handleStopGame]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border border-blue-100">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <FaGamepad className="text-blue-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Simon Says Game</h1>
          <p className="text-gray-600 mt-2">Test your memory with this IoT-powered game!</p>
        </div>
        
        {/* Device Status with better styling */}
        <div className="mb-8 p-5 rounded-xl bg-white shadow-md flex items-center justify-between border border-gray-100">
          <div className="flex items-center">
            <div 
              className={`w-4 h-4 rounded-full mr-3 ${
                statusLoading 
                  ? 'bg-yellow-500 animate-pulse' 
                  : deviceStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}
            ></div>
            <span className={`font-medium ${
              statusLoading 
                ? 'text-yellow-700' 
                : deviceStatus === 'connected' 
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {statusLoading 
                ? 'Checking device status...' 
                : deviceStatus === 'connected' 
                ? 'Device connected and ready' 
                : 'Device offline'}
            </span>
          </div>
          <button 
            onClick={checkDeviceStatus} 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium flex items-center"
            disabled={statusLoading}
          >
            <FaSync className={`mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {deviceStatus !== 'connected' && !statusLoading && (
          <div className="mb-8 p-6 rounded-xl bg-red-50 text-red-700 flex items-start border-l-4 border-red-500 shadow-md">
            <FaExclamationTriangle className="mt-1 mr-3 text-xl flex-shrink-0 text-red-500" />
            <div>
              <p className="font-bold text-lg mb-2">Device Not Connected</p>
              <p className="mb-3">
                The physical Simon Says device appears to be offline. Please check that:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>The device is powered on</li>
                <li>It's connected to WiFi</li>
                <li>The MQTT connection is working properly</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Player Name Input with better styling */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <FaUser className="text-indigo-600" />
            </div>
            <label htmlFor="playerName" className="text-lg font-semibold text-gray-800">
              Player Name
            </label>
          </div>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name to play"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isPlaying || loading}
          />
          {!playerName.trim() && !isPlaying && (
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <FaLightbulb className="text-yellow-500 mr-2" />
              Your name will appear on the leaderboard
            </p>
          )}
        </div>
        
        {/* Game Controls with better styling */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={handleStartGame}
            disabled={isPlaying || loading || !playerName.trim() || deviceStatus !== 'connected'}
            className={`py-3 px-6 rounded-xl font-semibold flex items-center justify-center transition-all ${
              isPlaying || loading || !playerName.trim() || deviceStatus !== 'connected'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:-translate-y-1'
            }`}
          >
            <FaPlay className="mr-2" />
            {loading ? 'Starting...' : 'Start Game'}
          </button>
          
          <button
            onClick={handleStopGame}
            disabled={!isPlaying || loading}
            className={`py-3 px-6 rounded-xl font-semibold flex items-center justify-center transition-all ${
              !isPlaying || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transform hover:-translate-y-1'
            }`}
          >
            <FaStop className="mr-2" />
            {loading ? 'Stopping...' : 'Stop Game'}
          </button>
        </div>
        
        {/* Game Status with better styling */}
        <div className="text-center mb-10">
          {isPlaying ? (
            <div className="p-6 bg-blue-100 rounded-xl shadow-inner">
              <p className="text-xl font-semibold text-blue-800 mb-1">
                Game in progress
              </p>
              <p className="text-blue-600">
                Follow the sequence on the physical device!
              </p>
            </div>
          ) : score > 0 ? (
            <div className="p-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrophy className="text-purple-600 text-2xl" />
              </div>
              <p className="text-xl font-semibold text-purple-800 mb-2">Game Over!</p>
              <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-blue-600 inline-block">Your Score: {score}</p>
            </div>
          ) : (
            <div className="p-6 bg-gray-100 rounded-xl">
              <p className="text-lg text-gray-600">
                Press "Start Game" to begin. The sequence will be shown on the physical device.
              </p>
            </div>
          )}
        </div>
        
        {/* Game Buttons with better styling */}
        <div className={`mb-10 p-10 ${isPlaying ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-gray-100'} rounded-xl shadow-inner transition-all`}>
          <p className="text-center mb-6 text-sm text-gray-500 flex items-center justify-center">
            <FaLightbulb className="text-yellow-500 mr-2" />
            <span>Visual representation of the game buttons <br/>(use the physical buttons on the device to play)</span>
          </p>
          {renderGameButtons()}
        </div>
        
        {/* Debug Buttons (only in development mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">Debug Controls</h3>
              <div className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">Development Only</div>
            </div>
            <button
              onClick={handleSubmitScore}
              className="btn bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition-all"
              disabled={loading}
            >
              Submit Test Score
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game; 