import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BunnyCatchGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [bunnies, setBunnies] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [combo, setCombo] = useState(0);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          return 0;
        }
        return prev - 1;
      });

      // Spawn new bunnies with better timing
      if (Math.random() < 0.4) {
        setBunnies(prev => [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 350 + 25,
          y: -60,
          speed: 1.5 + Math.random() * gameSpeed,
          type: Math.random() > 0.8 ? 'golden' : 'normal',
          rotation: Math.random() * 360
        }]);
      }
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [gameState, gameSpeed]);

  // Bunny movement with physics
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveInterval = setInterval(() => {
      setBunnies(prev => prev.map(bunny => ({
        ...bunny,
        y: bunny.y + bunny.speed,
        rotation: bunny.rotation + 2
      })).filter(bunny => bunny.y < 450));
    }, 16);

    return () => clearInterval(moveInterval);
  }, [gameState]);

  const catchBunny = useCallback((bunnyId, bunnyType) => {
    setBunnies(prev => prev.filter(bunny => bunny.id !== bunnyId));
    
    if (bunnyType === 'golden') {
      setScore(prev => prev + 20);
      setCombo(prev => prev + 2);
    } else {
      setScore(prev => prev + 1);
      setCombo(prev => prev + 1);
    }
  }, []);

  const missBunny = useCallback(() => {
    setLives(prev => {
      if (prev <= 1) {
        setGameState('gameOver');
        return 0;
      }
      return prev - 1;
    });
    setCombo(0);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setBunnies([]);
    setGameSpeed(1);
    setCombo(0);
  };

  const Bunny = ({ bunny }) => (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: bunny.x,
        top: bunny.y,
      }}
      initial={{ 
        scale: 0, 
        rotate: -180,
        opacity: 0,
        y: bunny.y - 50
      }}
      animate={{ 
        scale: 1, 
        rotate: bunny.rotation,
        opacity: 1,
        y: bunny.y 
      }}
      exit={{ 
        scale: 0, 
        rotate: bunny.rotation + 180,
        opacity: 0,
        y: bunny.y + 50
      }}
      whileHover={{ 
        scale: 1.1,
        filter: "brightness(1.2)"
      }}
      whileTap={{ 
        scale: 0.9,
        filter: "brightness(0.8)"
      }}
      onClick={() => catchBunny(bunny.id, bunny.type)}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Realistic Bunny with shadow and depth */}
      <div className="relative">
        {/* Shadow */}
        <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform translate-y-1"></div>
        
        {/* Bunny body */}
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
          bunny.type === 'golden' 
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg border-2 border-yellow-400' 
            : 'bg-gradient-to-br from-pink-300 to-pink-500 shadow-lg border-2 border-pink-400'
        }`}>
          {/* Inner glow */}
          <div className="absolute inset-1 bg-white/30 rounded-full"></div>
          
          {/* Bunny emoji */}
          <span className="relative z-10 drop-shadow-sm">🐰</span>
          
          {/* Golden sparkle effect */}
          {bunny.type === 'golden' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 0px rgba(255, 215, 0, 0.5)'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
              'linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
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
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              }}
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Bunny Catch
            </motion.h1>
            <motion.p
              className="text-xl text-white/80 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Catch the magical bunnies before they escape!
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
          <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-8">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{score}</div>
                  <div className="text-sm text-white/80 font-light">Score</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{lives}</div>
                  <div className="text-sm text-white/80 font-light">Lives</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{timeLeft}</div>
                  <div className="text-sm text-white/80 font-light">Time</div>
                </motion.div>
                {combo > 0 && (
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-yellow-400">{combo}x</div>
                    <div className="text-sm text-yellow-400/80 font-light">Combo</div>
                  </motion.div>
                )}
              </div>
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

          {/* Game Screen */}
          <div className="relative h-[500px] bg-gradient-to-b from-sky-900/50 to-emerald-900/50 overflow-hidden">
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
                    Ready to Catch?
                  </motion.h2>
                  <motion.p
                    className="text-white/80 mb-8 text-center max-w-md text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Click on the falling bunnies to catch them! Golden bunnies are worth more points and give combo bonuses.
                  </motion.p>
                  <motion.button
                    className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl border border-white/20"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 40px rgba(236, 72, 153, 0.4)",
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
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Game Instructions */}
                  <motion.div
                    className="absolute top-6 left-6 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center space-x-6 text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🐰</span>
                        <span className="font-medium">+1 point</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">✨</span>
                        <span className="font-medium text-yellow-400">+20 points</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bunnies */}
                  <AnimatePresence>
                    {bunnies.map(bunny => (
                      <Bunny key={bunny.id} bunny={bunny} />
                    ))}
                  </AnimatePresence>

                  {/* Score Popup */}
                  <AnimatePresence>
                    {score > 0 && (
                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-green-400 pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                          textShadow: '0 0 20px rgba(34, 197, 94, 0.8)',
                        }}
                      >
                        +{score}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {gameState === 'gameOver' && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="text-8xl mb-6"
                    animate={{ 
                      rotate: [0, -15, 15, 0],
                      scale: [1, 0.9, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    😢
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Game Over!
                  </motion.h2>
                  <motion.p
                    className="text-2xl text-white/80 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Final Score: <span className="text-yellow-400 font-bold">{score}</span>
                  </motion.p>
                  <div className="flex space-x-6">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startGame}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Play Again
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
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BunnyCatchGame;
