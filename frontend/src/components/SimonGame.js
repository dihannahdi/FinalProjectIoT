import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SimonGame = () => {
  const [gameState, setGameState] = useState({
    sequence: [],
    playerSequence: [],
    level: 1,
    isPlaying: false,
    isPlayerTurn: false,
    score: 0,
  });

  const [buttons, setButtons] = useState([
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-700', sound: 262 },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-700', sound: 330 },
    { id: 2, color: 'bg-green-500', activeColor: 'bg-green-700', sound: 392 },
    { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-700', sound: 523 },
  ]);

  const navigate = useNavigate();

  const generateSequence = useCallback(() => {
    const newSequence = [...gameState.sequence];
    newSequence.push(Math.floor(Math.random() * 4));
    setGameState(prev => ({ ...prev, sequence: newSequence }));
  }, [gameState.sequence]);

  const playSequence = useCallback(async () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    
    for (let i = 0; i < gameState.sequence.length; i++) {
      const buttonId = gameState.sequence[i];
      await new Promise(resolve => {
        setTimeout(() => {
          playButton(buttonId);
          resolve();
        }, 500);
      });
    }
    
    setGameState(prev => ({ ...prev, isPlaying: false, isPlayerTurn: true }));
  }, [gameState.sequence]);

  const playButton = (buttonId) => {
    const button = buttons[buttonId];
    const audio = new Audio(`/sounds/${buttonId}.mp3`);
    audio.play();
    
    // Visual feedback
    const buttonElement = document.getElementById(`button-${buttonId}`);
    buttonElement.classList.remove(button.color);
    buttonElement.classList.add(button.activeColor);
    
    setTimeout(() => {
      buttonElement.classList.remove(button.activeColor);
      buttonElement.classList.add(button.color);
    }, 300);
  };

  const handleButtonClick = (buttonId) => {
    if (!gameState.isPlayerTurn || gameState.isPlaying) return;

    playButton(buttonId);
    const newPlayerSequence = [...gameState.playerSequence, buttonId];
    setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence }));

    // Check if the sequence is correct
    if (newPlayerSequence[newPlayerSequence.length - 1] !== gameState.sequence[newPlayerSequence.length - 1]) {
      gameOver();
      return;
    }

    // Check if the level is complete
    if (newPlayerSequence.length === gameState.sequence.length) {
      levelComplete();
    }
  };

  const levelComplete = () => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      score: prev.score + (prev.level * 10),
      playerSequence: [],
      isPlayerTurn: false,
    }));
    
    setTimeout(() => {
      generateSequence();
      playSequence();
    }, 1000);
  };

  const gameOver = () => {
    toast.error(`Game Over! Your score: ${gameState.score}`);
    setGameState({
      sequence: [],
      playerSequence: [],
      level: 1,
      isPlaying: false,
      isPlayerTurn: false,
      score: 0,
    });
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      sequence: [],
      playerSequence: [],
      level: 1,
      score: 0,
    }));
    generateSequence();
    setTimeout(playSequence, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simon Says</h1>
          <p className="mt-2 text-gray-600">Level: {gameState.level}</p>
          <p className="text-gray-600">Score: {gameState.score}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {buttons.map((button) => (
            <button
              key={button.id}
              id={`button-${button.id}`}
              className={`${button.color} w-full h-32 rounded-lg transition-colors duration-200`}
              onClick={() => handleButtonClick(button.id)}
              disabled={!gameState.isPlayerTurn || gameState.isPlaying}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={startGame}
            disabled={gameState.isPlaying}
          >
            {gameState.isPlaying ? 'Playing...' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimonGame; 