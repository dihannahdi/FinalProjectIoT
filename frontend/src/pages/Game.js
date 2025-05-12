import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { startGame, stopGame, getDeviceStatus, submitScore } from '../services/gameService';
import { FaPlay, FaStop, FaSync, FaExclamationTriangle } from 'react-icons/fa';

const COLORS = ['red', 'green', 'blue', 'yellow'];

const Game = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [score, setScore] = useState(0);
  
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
  }, [isAuthenticated, currentUser]);
  
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
    } catch (error) {
      console.error('Error starting game:', error);
      setLoading(false);
      toast.error('Failed to start game');
    }
  };
  
  // Stop the game
  const handleStopGame = async () => {
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
  };
  
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
            className={`game-button simon-${color}`}
            disabled={!isPlaying}
            aria-label={`${color} button`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Simon Says Game</h1>
        
        {/* Device Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${
                statusLoading 
                  ? 'bg-yellow-500' 
                  : deviceStatus === 'connected' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
            ></div>
            <span>
              {statusLoading 
                ? 'Checking device status...' 
                : deviceStatus === 'connected' 
                ? 'Device connected' 
                : 'Device offline'}
            </span>
          </div>
          <button 
            onClick={checkDeviceStatus} 
            className="btn btn-secondary text-sm px-3 py-1"
            disabled={statusLoading}
          >
            <FaSync className={`inline mr-1 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {deviceStatus !== 'connected' && !statusLoading && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
            <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="font-bold">Device Not Connected</p>
              <p className="text-sm">
                The physical Simon Says device appears to be offline. Please check that:
              </p>
              <ul className="text-sm list-disc ml-5 mt-2">
                <li>The device is powered on</li>
                <li>It's connected to WiFi</li>
                <li>The MQTT connection is working properly</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Player Name Input */}
        <div className="mb-6">
          <label htmlFor="playerName" className="block mb-2 font-medium">
            Your Name
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="form-control"
            disabled={isPlaying || loading}
          />
        </div>
        
        {/* Game Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleStartGame}
            disabled={isPlaying || loading || !playerName.trim() || deviceStatus !== 'connected'}
            className="btn btn-success flex items-center"
          >
            <FaPlay className="mr-2" />
            Start Game
          </button>
          
          <button
            onClick={handleStopGame}
            disabled={!isPlaying || loading}
            className="btn btn-danger flex items-center"
          >
            <FaStop className="mr-2" />
            Stop Game
          </button>
        </div>
        
        {/* Game Status */}
        <div className="text-center mb-8">
          {isPlaying ? (
            <p className="text-lg">
              Game in progress. Follow the sequence on the physical device!
            </p>
          ) : score > 0 ? (
            <div className="p-6 bg-blue-50 rounded-lg">
              <p className="text-xl mb-2">Game Over!</p>
              <p className="text-3xl font-bold text-blue-600">Your Score: {score}</p>
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              Press "Start Game" to begin. The sequence will be shown on the physical device.
            </p>
          )}
        </div>
        
        {/* Game Buttons (visual representation only) */}
        <div className={`mb-8 p-8 bg-gray-50 rounded-lg ${isPlaying ? 'border-2 border-blue-400' : ''}`}>
          <p className="text-center mb-4 text-sm text-gray-500">
            (This is a visual representation. Use the physical buttons to play)
          </p>
          {renderGameButtons()}
        </div>
        
        {/* Debug Buttons (only in development mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-2">Debug Controls</h3>
            <button
              onClick={handleSubmitScore}
              className="btn btn-secondary"
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