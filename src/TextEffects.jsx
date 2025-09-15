import React from 'react';
import { motion } from 'framer-motion';

const TextEffects = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Text Effects
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Rainbow and Neon text effects with smooth animations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rainbow Text Effect */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🌈</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Rainbow Text</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">Animated rainbow gradient text with smooth transitions</p>
              
              {/* Rainbow Text Display */}
              <div className="relative w-full h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                <motion.h2
                  className="text-4xl font-bold text-center"
                  style={{
                    background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Rainbow Text
                </motion.h2>
              </div>
            </div>
          </motion.div>

          {/* Neon Text Effect */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Neon Text</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">Glowing neon text with pulsing effects</p>
              
              {/* Neon Text Display */}
              <div className="relative w-full h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                <motion.h2
                  className="text-4xl font-bold text-cyan-400 text-center"
                  style={{
                    textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
                      '0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff',
                      '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Neon Glow
                </motion.h2>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TextEffects;