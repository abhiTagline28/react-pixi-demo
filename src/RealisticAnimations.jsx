import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RealisticAnimations = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Realistic Particle System (keeping the good one)
  const RealisticParticleSystem = () => {
    const particles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 300,
      size: Math.random() * 6 + 3,
      color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 7)],
      speed: Math.random() * 2 + 0.5,
      direction: Math.random() * Math.PI * 2,
    }));

    return (
      <div className="relative w-96 h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-700">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              left: particle.x,
              top: particle.y,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              x: [0, Math.cos(particle.direction) * 100],
              y: [0, Math.sin(particle.direction) * 100],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 1, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: particle.id * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  // Realistic 3D Card with proper shadows and depth
  const Realistic3DCard = () => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <div className="perspective-1000">
        <motion.div
          className="relative w-72 h-48 cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          onClick={() => setIsFlipped(!isFlipped)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-2xl"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden rounded-xl p-6 flex flex-col justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Credit Card</h3>
                <div className="text-sm opacity-80">**** **** **** 1234</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-white text-sm">JOHN DOE</div>
                <div className="text-white text-xs opacity-60">12/25</div>
              </div>
            </div>

            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden rounded-xl p-6 flex flex-col justify-between"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="h-8 bg-black rounded mt-4"></div>
              <div className="bg-white h-6 rounded flex items-center px-2">
                <div className="text-black text-xs font-mono">123</div>
              </div>
              <div className="text-white text-xs opacity-60">Authorized Signature</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  // Realistic 3D Button with depth and shadows
  const Realistic3DButton = () => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <motion.button
        className="relative px-8 py-4 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg border border-blue-400 overflow-hidden"
        style={{
          boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 12px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
        whileTap={{ 
          scale: 0.95,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        {/* Button highlight */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
          animate={{ opacity: isPressed ? 0.1 : 0.3 }}
        />
        
        {/* Button text */}
        <span className="relative z-10">Click Me!</span>
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: isPressed ? 1 : 0, 
            opacity: isPressed ? 0.3 : 0 
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    );
  };

  // Realistic Loading Spinner with proper physics
  const RealisticLoadingSpinner = () => {
    return (
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-4 border-gray-300 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-gray-200 border-b-green-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-gray-100 border-r-red-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  };

  // Realistic Progress Bar with smooth animation
  const RealisticProgressBar = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(prev => (prev + 1) % 101);
      }, 50);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-80 h-4 bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full relative"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          {progress}%
        </div>
      </div>
    );
  };

  // Realistic Modal with backdrop blur
  const RealisticModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <motion.button
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          Open Modal
        </motion.button>

        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Realistic Modal</h3>
              <p className="text-gray-600 mb-6">This modal has proper backdrop blur and smooth animations.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  };

  // Realistic Toggle Switch
  const RealisticToggleSwitch = () => {
    const [isOn, setIsOn] = useState(false);

    return (
      <motion.div
        className="relative w-16 h-8 bg-gray-300 rounded-full cursor-pointer"
        onClick={() => setIsOn(!isOn)}
        animate={{ backgroundColor: isOn ? '#10b981' : '#d1d5db' }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
          animate={{ x: isOn ? 32 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
        />
      </motion.div>
    );
  };

  // Realistic Floating Action Button
  const RealisticFAB = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="relative">
        <motion.button
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            +
          </motion.span>
        </motion.button>

        {/* Floating menu items */}
        <motion.div
          className="absolute bottom-16 right-0 space-y-3"
          initial={false}
          animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded && (
            <>
              <motion.button
                className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                📝
              </motion.button>
              <motion.button
                className="w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
              >
                📷
              </motion.button>
              <motion.button
                className="w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
              >
                📍
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    );
  };

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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Realistic Animations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              High-quality 2D and 3D animations with realistic effects and smooth interactions
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Particle System */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Particle System</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Interactive particle effects with realistic physics</p>
              <div className="flex justify-center">
                <RealisticParticleSystem />
              </div>
            </div>
          </motion.div>

          {/* 3D Card */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💳</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">3D Credit Card</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Realistic card flip animation with depth</p>
              <div className="flex justify-center">
                <Realistic3DCard />
              </div>
            </div>
          </motion.div>

          {/* 3D Button */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🔘</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">3D Button</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Interactive button with press effects</p>
              <div className="flex justify-center">
                <Realistic3DButton />
              </div>
            </div>
          </motion.div>

          {/* Loading Spinner */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">⏳</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Loading Spinner</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Multi-ring loading animation</p>
              <div className="flex justify-center">
                <RealisticLoadingSpinner />
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Progress Bar</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Animated progress with shimmer effect</p>
              <div className="flex justify-center">
                <RealisticProgressBar />
              </div>
            </div>
          </motion.div>

          {/* Modal */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Modal Dialog</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Backdrop blur modal with smooth animations</p>
              <div className="flex justify-center">
                <RealisticModal />
              </div>
            </div>
          </motion.div>

          {/* Toggle Switch */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🔘</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Toggle Switch</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Smooth toggle with color transitions</p>
              <div className="flex justify-center">
                <RealisticToggleSwitch />
              </div>
            </div>
          </motion.div>

          {/* Floating Action Button */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden md:col-span-2 xl:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Floating Action Button</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Expandable FAB with menu items</p>
              <div className="flex justify-center">
                <RealisticFAB />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RealisticAnimations;
