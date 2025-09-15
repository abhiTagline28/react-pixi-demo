import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BunnyMemoryGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const bunnyEmojis = ['🐰', '🐇', '🥕', '🌿', '🌸', '🦋', '🌞', '🌙'];

  const initializeGame = useCallback(() => {
    // Create pairs of cards
    const cardPairs = [...bunnyEmojis, ...bunnyEmojis];
    
    // Shuffle the cards
    const shuffledCards = cardPairs
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setTimeElapsed(0);
    setIsProcessing(false);
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === bunnyEmojis.length && gameState === 'playing') {
      setTimeout(() => {
        setGameState('victory');
      }, 500);
    }
  }, [matchedPairs.length, bunnyEmojis.length, gameState]);

  const handleCardClick = useCallback((cardId) => {
    if (isProcessing || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);

      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)
      );

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, firstCard.id, secondCard.id]);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1500);
      }
    }
  }, [cards, flippedCards, matchedPairs, isProcessing]);

  const startGame = () => {
    setGameState('playing');
    initializeGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Card = ({ card }) => {
    const isFlipped = flippedCards.includes(card.id);
    const isMatched = matchedPairs.includes(card.id);

    return (
      <motion.div
        className="relative w-20 h-20 cursor-pointer perspective-1000"
        onClick={() => handleCardClick(card.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg border-2 border-white/20 flex items-center justify-center">
              <motion.div
                className="text-2xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎴
              </motion.div>
            </div>
          </div>

          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className={`w-full h-full rounded-xl shadow-lg border-2 flex items-center justify-center ${
              isMatched 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300' 
                : 'bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-300'
            }`}>
              <motion.div
                className="text-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {card.emoji}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Glow effect for matched cards */}
        {isMatched && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                '0 0 0px rgba(34, 197, 94, 0.5)',
                '0 0 20px rgba(34, 197, 94, 0.8)',
                '0 0 0px rgba(34, 197, 94, 0.5)'
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
              'linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))',
              'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300/30 text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          >
            ✨
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
                background: 'linear-gradient(45deg, #a855f7, #ec4899, #3b82f6, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              }}
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Bunny Memory
            </motion.h1>
            <motion.p
              className="text-xl text-white/80 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Test your memory with magical bunny cards!
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
                  <div className="text-3xl font-bold text-white">{moves}</div>
                  <div className="text-sm text-white/80 font-light">Moves</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-white/80 font-light">Time</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">{matchedPairs.length / 2}</div>
                  <div className="text-sm text-white/80 font-light">Pairs</div>
                </motion.div>
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
          <div className="relative h-[500px] bg-gradient-to-b from-purple-900/50 to-pink-900/50 overflow-hidden">
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
                    🧠
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Ready to Test Your Memory?
                  </motion.h2>
                  <motion.p
                    className="text-white/80 mb-8 text-center max-w-md text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Find all the matching pairs! Click on cards to flip them and test your memory skills.
                  </motion.p>
                  <motion.button
                    className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold text-xl shadow-2xl border border-white/20"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)",
                      filter: "brightness(1.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Start Game
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
                  {/* Game Grid */}
                  <div className="flex justify-center items-center h-full">
                    <motion.div
                      className="grid grid-cols-4 gap-4 bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {cards.map((card) => (
                        <Card key={card.id} card={card} />
                      ))}
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <motion.div
                    className="absolute bottom-6 left-6 right-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between text-white mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm">{matchedPairs.length / 2} / {bunnyEmojis.length}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(matchedPairs.length / 2 / bunnyEmojis.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
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
                    Congratulations!
                  </motion.h2>
                  <motion.p
                    className="text-2xl text-white/80 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    You completed the game in <span className="text-purple-400 font-bold">{moves}</span> moves!
                  </motion.p>
                  <motion.p
                    className="text-xl text-white/60 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Time: <span className="text-pink-400 font-bold">{formatTime(timeElapsed)}</span>
                  </motion.p>
                  <div className="flex space-x-6">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startGame}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
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
                      transition={{ delay: 0.8 }}
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

export default BunnyMemoryGame;