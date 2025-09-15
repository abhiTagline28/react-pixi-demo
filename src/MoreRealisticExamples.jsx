import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MoreRealisticExamples = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const images = [
    { id: 1, color: 'from-red-500 to-pink-500', title: 'Sunset' },
    { id: 2, color: 'from-blue-500 to-cyan-500', title: 'Ocean' },
    { id: 3, color: 'from-green-500 to-emerald-500', title: 'Forest' },
    { id: 4, color: 'from-purple-500 to-violet-500', title: 'Mountains' },
  ];

  // Realistic Image Carousel with smooth transitions
  const ImageCarousel = () => {
    useEffect(() => {
      if (isPlaying) {
        const interval = setInterval(() => {
          setCurrentImage(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [isPlaying]);

    return (
      <div className="relative w-80 h-48 overflow-hidden rounded-2xl bg-gray-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            className={`absolute inset-0 bg-gradient-to-br ${images[currentImage].color} flex items-center justify-center text-white font-bold text-xl`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {images[currentImage].title}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <motion.button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentImage === index ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImage(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>

        {/* Play/Pause button */}
        <motion.button
          className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
          onClick={() => setIsPlaying(!isPlaying)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </motion.button>
      </div>
    );
  };

  // Realistic Notification Toast
  const NotificationToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (type) => {
      const id = Date.now();
      const newToast = {
        id,
        type,
        message: type === 'success' ? 'Success! Action completed.' : 
                type === 'error' ? 'Error! Something went wrong.' : 
                'Info: Here is some information.',
        color: type === 'success' ? 'bg-green-500' : 
               type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      };
      
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    };

    return (
      <div className="space-y-4">
        <div className="flex space-x-3">
          <motion.button
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToast('success')}
          >
            Success Toast
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToast('error')}
          >
            Error Toast
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToast('info')}
          >
            Info Toast
          </motion.button>
        </div>

        {/* Toast container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                className={`${toast.color} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-64`}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm font-medium">{toast.message}</span>
                <motion.button
                  className="ml-2 text-white/80 hover:text-white"
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  whileHover={{ scale: 1.1 }}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Realistic Search Bar with suggestions
  const RealisticSearchBar = () => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions] = useState(['React', 'JavaScript', 'TypeScript', 'Framer Motion', 'CSS', 'HTML']);

    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="relative w-80">
        <motion.div
          className="relative"
          animate={{ scale: isFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400"
            style={{ boxShadow: isFocused ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none' }}
          />
          
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
            animate={{ rotate: isFocused ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            🔍
          </motion.div>
        </motion.div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {isFocused && query && filteredSuggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  className="px-4 py-2 text-white hover:bg-white/10 cursor-pointer"
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {suggestion}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Realistic Card Hover Effect
  const RealisticCardHover = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const cards = [
      { title: 'Design', icon: '🎨', color: 'from-pink-500 to-rose-500' },
      { title: 'Development', icon: '💻', color: 'from-blue-500 to-cyan-500' },
      { title: 'Marketing', icon: '📈', color: 'from-green-500 to-emerald-500' },
    ];

    return (
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className={`relative h-32 bg-gradient-to-br ${card.color} rounded-xl cursor-pointer overflow-hidden`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: hoveredCard === index ? '0 20px 40px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)' }}
          >
            {/* Card content */}
            <div className="p-4 h-full flex flex-col justify-between text-white">
              <div className="text-2xl">{card.icon}</div>
              <div className="text-sm font-medium">{card.title}</div>
            </div>

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredCard === index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  // Realistic Typing Animation
  const TypingAnimation = () => {
    const [displayText, setDisplayText] = useState('');
    const fullText = 'Hello, this is a realistic typing animation!';

    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setDisplayText('');
            index = 0;
          }, 2000);
        }
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-80 h-16 bg-gray-800 rounded-lg flex items-center px-4">
        <span className="text-white font-mono text-lg">
          {displayText}
          <motion.span
            className="inline-block w-2 h-6 bg-white ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              More Realistic Examples
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Additional high-quality animations and interactions with modern design
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🖼️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Image Carousel</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Smooth image transitions with auto-play</p>
              <div className="flex justify-center">
                <ImageCarousel />
              </div>
            </div>
          </motion.div>

          {/* Notification Toast */}
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
                  <span className="text-white text-lg">🔔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Notification Toast</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Slide-in notifications with auto-dismiss</p>
              <div className="flex justify-center">
                <NotificationToast />
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Search Bar</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Live search with suggestions dropdown</p>
              <div className="flex justify-center">
                <RealisticSearchBar />
              </div>
            </div>
          </motion.div>

          {/* Card Hover Effects */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎴</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Card Hover Effects</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Interactive cards with lift animations</p>
              <div className="flex justify-center">
                <RealisticCardHover />
              </div>
            </div>
          </motion.div>

          {/* Typing Animation */}
          <motion.div
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">⌨️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Typing Animation</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Realistic typing effect with blinking cursor</p>
              <div className="flex justify-center">
                <TypingAnimation />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MoreRealisticExamples;
