import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BunnyMazeGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bunnyPosition, setBunnyPosition] = useState({ x: 1, y: 1 });
  const [targetPosition, setTargetPosition] = useState({ x: 8, y: 8 });
  const [moves, setMoves] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // Enhanced maze layouts for different levels
  const mazeLayouts = {
    1: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    2: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    3: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  };

  const currentMaze = mazeLayouts[currentLevel];

  const moveBunny = useCallback((direction) => {
    if (isMoving) return;

    const newPosition = { ...bunnyPosition };
    
    switch (direction) {
      case 'up':
        newPosition.y = Math.max(0, bunnyPosition.y - 1);
        break;
      case 'down':
        newPosition.y = Math.min(9, bunnyPosition.y + 1);
        break;
      case 'left':
        newPosition.x = Math.max(0, bunnyPosition.x - 1);
        break;
      case 'right':
        newPosition.x = Math.min(9, bunnyPosition.x + 1);
        break;
    }

    // Check if the new position is valid (not a wall)
    if (currentMaze[newPosition.y][newPosition.x] === 0) {
      setIsMoving(true);
      setBunnyPosition(newPosition);
      setMoves(prev => prev + 1);
      
      // Check if reached target
      if (newPosition.x === targetPosition.x && newPosition.y === targetPosition.y) {
        setTimeout(() => {
          if (currentLevel < 3) {
            setCurrentLevel(prev => prev + 1);
            setBunnyPosition({ x: 1, y: 1 });
            setTargetPosition({ x: 8, y: 8 });
            setMoves(0);
            setGameState('levelComplete');
          } else {
            setGameState('victory');
          }
        }, 500);
      }
      
      setTimeout(() => setIsMoving(false), 200);
    }
  }, [bunnyPosition, currentMaze, targetPosition, currentLevel, isMoving]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveBunny('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveBunny('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveBunny('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveBunny('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, moveBunny]);

  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setBunnyPosition({ x: 1, y: 1 });
    setTargetPosition({ x: 8, y: 8 });
    setMoves(0);
    setIsMoving(false);
  };

  const resetLevel = () => {
    setBunnyPosition({ x: 1, y: 1 });
    setTargetPosition({ x: 8, y: 8 });
    setMoves(0);
    setIsMoving(false);
  };

  const nextLevel = () => {
    setGameState('playing');
    setBunnyPosition({ x: 1, y: 1 });
    setTargetPosition({ x: 8, y: 8 });
    setMoves(0);
    setIsMoving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-teal-600/20"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(20, 184, 166, 0.2))',
              'linear-gradient(45deg, rgba(20, 184, 166, 0.2), rgba(6, 182, 212, 0.2))',
              'linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(34, 197, 94, 0.2))'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating leaves */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400/20 text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            🍃
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl font-bold mb-4"
              style={{
                background: 'linear-gradient(45deg, #10b981, #06b6d4, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              }}
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Bunny Maze
            </motion.h1>
            <motion.p
              className="text-xl text-white/80 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Navigate through the enchanted maze to find the golden carrot!
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <motion.div
          className="bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Game Stats */}
          <div className="bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-8">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">Level {currentLevel}</div>
                  <div className="text-sm text-white/80 font-light">Current</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{moves}</div>
                  <div className="text-sm text-white/80 font-light">Moves</div>
                </motion.div>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetLevel}
                >
                  <span className="text-white font-medium">Reset</span>
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGameState('menu')}
                >
                  <span className="text-white font-medium">Menu</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Game Screen */}
          <div className="relative h-[500px] bg-gradient-to-b from-emerald-900/50 to-teal-900/50 overflow-hidden">
            <AnimatePresence mode="wait">
              {gameState === 'menu' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-8xl mb-6"
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                      filter: [
                        'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                        'drop-shadow(0 0 40px rgba(255, 255, 255, 0.6))',
                        'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                      ]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🐰
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Ready to Explore?
                  </motion.h2>
                  <motion.p
                    className="text-white/80 mb-8 text-center max-w-md text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Use arrow keys or WASD to navigate through the maze and reach the golden carrot!
                  </motion.p>
                  <motion.button
                    className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-xl shadow-2xl border border-white/20"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
                      filter: "brightness(1.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Start Adventure
                  </motion.button>
                </motion.div>
              )}

              {gameState === 'playing' && (
                <motion.div
                  className="absolute inset-0 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Controls */}
                  <motion.div
                    className="absolute top-6 left-6 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="text-white text-sm mb-2 font-medium">Controls:</div>
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">↑</span>
                        <span className="text-xs">Up</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">↓</span>
                        <span className="text-xs">Down</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">←</span>
                        <span className="text-xs">Left</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">→</span>
                        <span className="text-xs">Right</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Maze */}
                  <div className="flex justify-center items-center h-full">
                    <motion.div
                      className="grid grid-cols-10 gap-2 bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {currentMaze.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center relative ${
                              cell === 1 
                                ? 'bg-gray-800 shadow-inner border border-gray-700' 
                                : 'bg-white/90 shadow-lg border border-white/30'
                            }`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: (rowIndex + colIndex) * 0.02,
                              duration: 0.3,
                              ease: "easeOut"
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {/* Wall texture */}
                            {cell === 1 && (
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg opacity-80"></div>
                            )}
                            
                            {/* Bunny */}
                            {rowIndex === bunnyPosition.y && colIndex === bunnyPosition.x && (
                              <motion.div
                                className="text-3xl relative z-10"
                                animate={{ 
                                  rotate: [0, 5, -5, 0],
                                  scale: [1, 1.1, 1],
                                  filter: [
                                    'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                                    'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                                    'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                                  ]
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                🐰
                              </motion.div>
                            )}
                            
                            {/* Carrot */}
                            {rowIndex === targetPosition.y && colIndex === targetPosition.x && (
                              <motion.div
                                className="text-3xl relative z-10"
                                animate={{ 
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.2, 1],
                                  filter: [
                                    'drop-shadow(0 0 15px rgba(255, 165, 0, 0.6))',
                                    'drop-shadow(0 0 30px rgba(255, 165, 0, 1))',
                                    'drop-shadow(0 0 15px rgba(255, 165, 0, 0.6))'
                                  ]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                🥕
                              </motion.div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {gameState === 'levelComplete' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="text-8xl mb-6"
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🎉
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Level Complete!
                  </motion.h2>
                  <motion.p
                    className="text-2xl text-white/80 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Moves: <span className="text-emerald-400 font-bold">{moves}</span>
                  </motion.p>
                  <div className="flex space-x-6">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextLevel}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Next Level
                    </motion.button>
                    <motion.button
                      className="px-8 py-4 bg-gray-600/80 backdrop-blur-sm text-white rounded-2xl font-bold text-lg shadow-xl border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameState('menu')}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      Menu
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {gameState === 'victory' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="text-8xl mb-6"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🏆
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Congratulations!
                  </motion.h2>
                  <motion.p
                    className="text-2xl text-white/80 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    You completed all levels!
                  </motion.p>
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Play Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BunnyMazeGame;