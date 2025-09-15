import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Application, extend, useTick } from "@pixi/react";
import { motion, AnimatePresence } from "framer-motion";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const HandTossCoinChild = ({
  coinRotation,
  isFlipping,
  result,
  setCoinRotation,
  setCoinScale,
  setCoinY,
  setCoinX,
  setIsFlipping,
  drawCoin,
  drawBackground,
  drawResultCoin,
  handTexture,
  hand2Texture,
  hand3Texture,
  showCoin,
  hand2X,
  setHand2X,
  hand2Moving,
  setHand2Moving,
  showHand33,
  setShowHand33,
  setCoinResult,
  setShowResultEnabled,
  setTryAgainEnabled,
  showResultEnabled,
  tryAgainEnabled,
  coinResult,
  slowFlipRotation,
  setSlowFlipRotation,
  setShowCoin,
  coinTrail,
  particles,
  createParticle,
  setParticles,
  slowMotionMode,
}) => {
  const [flipCount, setFlipCount] = useState(0);
  const handRef = useRef(null);
  const hand2Ref = useRef(null);
  const coinRef = useRef(null);

  useTick(() => {
    // Horizontal flipping animation with increasing speed as hand22 approaches
    if (!isFlipping && hand2X > 300 && !result) {
      const distanceFromTarget = hand2X - 300;
      const maxDistance = 300;
      const speedMultiplier = 1 + (maxDistance - distanceFromTarget) / maxDistance;
      const baseSpeed = 0.15;
      const currentSpeed = baseSpeed * speedMultiplier;
      
      setSlowFlipRotation((prev) => prev + currentSpeed);
    }

    // Handle hand22 movement to cover coin
    if (hand2Moving && hand2X > 300 && !isFlipping) {
      setHand2X((prev) => {
        const distanceFromTarget = prev - 300;
        const speedMultiplier = Math.max(0.3, Math.min(2.0, distanceFromTarget / 50));
        const newX = prev - (8 * speedMultiplier);
        
        if (prev === 600 && newX === 595) {
          const randomResult = Math.random() < 0.5 ? "heads" : "tails";
          setCoinResult(randomResult);
          setShowCoin(false);
        }
        
        if (newX <= 300) {
          setHand2Moving(false);
          return 300;
        }
        return newX;
      });
    }

    if (isFlipping) {
      setFlipCount((prev) => prev + 1);

      const timeMultiplier = slowMotionMode ? 0.3 : 1;
      const time = flipCount * 0.016 * timeMultiplier;

      const easeOutQuad = (t) => t * (2 - t);
      const easeInQuad = (t) => t * t;

      // Enhanced phase-based animation with realistic physics
      if (flipCount < 25) {
        const moveProgress = flipCount / 25;
        const easedProgress = easeOutQuad(moveProgress);
        
        setHand2X(() => {
          const startX = 300;
          const endX = 520;
          return startX + (endX - startX) * easedProgress;
        });
        
        setCoinY(() => 250);
        setCoinX(() => 300);
        setCoinRotation((prev) => prev + 0.08);
        setCoinScale(() => 1);
      } else if (flipCount < 35) {
        setShowHand33(true);
        setCoinY(() => 250);
        setCoinX(() => 300);
        setCoinRotation((prev) => prev + 0.12);
        setCoinScale(() => 1 + Math.sin(time * 8) * 0.05);
      } else if (flipCount < 85) {
        const launchProgress = (flipCount - 35) / 50;
        const easedProgress = easeOutQuad(launchProgress);

        setCoinY(() => {
          const startY = 250;
          const endY = 50;
          const arcOffset = Math.sin(launchProgress * Math.PI) * 15;
          return startY + (endY - startY) * easedProgress - arcOffset;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.5) * 4;
          const launchDrift = Math.sin(launchProgress * Math.PI) * 8;
          return 300 + drift + launchDrift;
        });

        setCoinRotation((prev) => prev + 1.8);
        setCoinScale(() => 1 + Math.sin(time * 20) * 0.2 + Math.sin(launchProgress * Math.PI) * 0.1);
      } else if (flipCount < 125) {
        setCoinY(() => {
          const hoverY = 50 + Math.sin(time * 6) * 8;
          const gravityDrift = (flipCount - 85) * 0.3;
          return Math.max(hoverY - gravityDrift, 45);
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.8) * 3;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 1.6);
        setCoinScale(() => 1 + Math.sin(time * 22) * 0.25);
      } else if (flipCount < 175) {
        const fallProgress = (flipCount - 125) / 50;

        if (flipCount === 125) {
          setShowHand33(false);
        }

        setCoinY(() => {
          const startY = 50;
          const endY = 250;
          const gravityAcceleration = Math.pow(fallProgress, 1.5);
          return startY + (endY - startY) * gravityAcceleration;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.2) * 2;
          const fallTrajectory = Math.sin(fallProgress * Math.PI) * 6;
          return 300 + drift + fallTrajectory;
        });

        setCoinRotation((prev) => prev + 1.2);
        setCoinScale(() => 1 + Math.sin(time * 25) * 0.2);
      } else if (flipCount < 200) {
        const settleProgress = (flipCount - 175) / 25;

        setCoinY((prev) => {
          const targetY = 250;
          const diff = targetY - prev;
          const bounceAmplitude = 15 * Math.pow(1 - settleProgress, 2);
          const bounce = Math.sin(settleProgress * Math.PI * 3) * bounceAmplitude;
          return prev + diff * 0.3 + bounce;
        });

        setCoinX((prev) => {
          const targetX = 300;
          const diff = targetX - prev;
          const settleOvershoot = Math.sin(settleProgress * Math.PI) * 3;
          return prev + diff * 0.25 + settleOvershoot;
        });

        setCoinRotation((prev) => prev + 0.3);
        setCoinScale((prev) => {
          const targetScale = 1;
          const diff = targetScale - prev;
          return prev + diff * 0.2;
        });
      }

      if (flipCount > 200) {
        setIsFlipping(false);
        setFlipCount(0);
        setHand2X(300);

        const finalRotation = coinRotation % (Math.PI * 2);
        const flipResult = finalRotation < Math.PI ? "heads" : "tails";
        
        setCoinResult(flipResult);

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const distance = 30;
          const particleX = 300 + Math.cos(angle) * distance;
          const particleY = 250 + Math.sin(angle) * distance;
          const celebrationParticle = createParticle(particleX, particleY, flipResult === 'heads' ? 'gold' : 'silver');
          setParticles(prev => [...prev, celebrationParticle]);
        }

        setShowResultEnabled(true);
        setTryAgainEnabled(true);
        setHand2X(300);
      }
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiSprite
        ref={handRef}
        texture={showHand33 ? hand3Texture : handTexture}
        x={300}
        y={250}
        width={200}
        height={150}
        anchor={0.5}
        alpha={1}
        scale={showHand33 ? 1.05 : 1}
      />
      <pixiSprite
        ref={hand2Ref}
        texture={hand2Texture}
        x={hand2X}
        y={250}
        width={200}
        height={150}
        anchor={0.5}
        alpha={hand2X > 300 ? 0.9 : 1}
        scale={hand2Moving ? 1.02 : 1}
      />
      {showCoin && hand2X > 320 && !result && (
        <pixiGraphics ref={coinRef} draw={drawCoin} />
      )}
      {result && (
        <>
          <pixiGraphics draw={(graphics) => drawResultCoin(graphics, result)} />
          <pixiText
            text={result.toUpperCase()}
            x={300}
            y={320}
            anchor={0.5}
            style={{
              fontSize: 28,
              fill: result === "heads" ? 0xffd700 : 0xff6b6b,
              stroke: 0x000000,
              strokeThickness: 4,
              fontWeight: "bold",
              dropShadow: true,
              dropShadowColor: 0x000000,
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 4,
              dropShadowDistance: 2,
            }}
          />
        </>
      )}
    </>
  );
};

const AdvancedHandTossCoinWithStats = () => {
  const [gameState, setGameState] = useState("menu");
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(250);
  const [coinX, setCoinX] = useState(300);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [handTexture, setHandTexture] = useState(Texture.EMPTY);
  const [hand2Texture, setHand2Texture] = useState(Texture.EMPTY);
  const [hand3Texture, setHand3Texture] = useState(Texture.EMPTY);
  const [showCoin, setShowCoin] = useState(true);
  const [hand2X, setHand2X] = useState(600);
  const [hand2Moving, setHand2Moving] = useState(false);
  const [showHand33, setShowHand33] = useState(false);
  const [showResultEnabled, setShowResultEnabled] = useState(false);
  const [tryAgainEnabled, setTryAgainEnabled] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [slowFlipRotation, setSlowFlipRotation] = useState(0);
  const [particles, setParticles] = useState([]);
  const [cameraShake, setCameraShake] = useState({ x: 0, y: 0, intensity: 0 });
  const [coinTrail, setCoinTrail] = useState([]);
  const [environmentEffects, setEnvironmentEffects] = useState({
    wind: 0,
    lighting: 1,
    atmosphere: 0
  });
  const [slowMotionMode, setSlowMotionMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [flipHistory, setFlipHistory] = useState([]);
  
  // Enhanced statistics state
  const [sessionStats, setSessionStats] = useState({
    startTime: Date.now(),
    totalFlips: 0,
    headsFlips: 0,
    tailsFlips: 0,
    longestHeadsStreak: 0,
    longestTailsStreak: 0,
    currentStreak: { type: null, count: 0 },
    flipTimes: [],
    averageFlipTime: 0
  });
  
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [exportData, setExportData] = useState(null);

  // Load hand textures
  useEffect(() => {
    if (handTexture === Texture.EMPTY) {
      Assets.load("/hand11.png").then((result) => {
        setHandTexture(result);
      }).catch((error) => {
        console.error("Failed to load hand11 image:", error);
      });
    }
    if (hand2Texture === Texture.EMPTY) {
      Assets.load("/hand22.png").then((result) => {
        setHand2Texture(result);
      }).catch((error) => {
        console.error("Failed to load hand22 image:", error);
      });
    }
    if (hand3Texture === Texture.EMPTY) {
      Assets.load("/hand33.png").then((result) => {
        setHand3Texture(result);
      }).catch((error) => {
        console.error("Failed to load hand33 image:", error);
      });
    }
  }, [handTexture, hand2Texture, hand3Texture]);

  // Move hand22 to cover coin after 3 seconds
  useEffect(() => {
    if (hand2X === 600 && !hand2Moving && !isFlipping) {
      const timer = setTimeout(() => {
        setHand2Moving(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hand2X, hand2Moving, isFlipping]);

  const flipCoin = useCallback(() => {
    if (isFlipping) return;
    setShowCoin(true);
    setIsFlipping(true);
    setResult(null);
  }, [isFlipping]);

  const testHand22Movement = useCallback(() => {
    setHand2Moving(true);
  }, []);

  const showResult = useCallback(() => {
    if (!showResultEnabled || !coinResult) return;
    
    setHand2X(500);
    setResult(coinResult);
    setShowCoin(true);
    setScore((prev) => prev + 1);
    setShowResultEnabled(false);
  }, [showResultEnabled, coinResult]);

  const tryAgain = useCallback(() => {
    if (!tryAgainEnabled) return;
    
    setResult(null);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(250);
    setCoinX(300);
    setCoinResult(null);
    setShowResultEnabled(false);
    setTryAgainEnabled(false);
    setShowHand33(false);
    setSlowFlipRotation(0);
    
    setHand2X(600);
    setHand2Moving(false);
    
    setTimeout(() => {
      setHand2Moving(true);
    }, 1000);
  }, [tryAgainEnabled]);

  const resetGame = useCallback(() => {
    setScore(0);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
    setIsFlipping(false);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(250);
    setCoinX(300);
    setShowCoin(true);
    setHand2X(600);
    setHand2Moving(false);
    setShowHand33(false);
    setShowResultEnabled(false);
    setTryAgainEnabled(false);
    setCoinResult(null);
    setSlowFlipRotation(0);
    setFlipHistory([]);
    setSessionStats({
      startTime: Date.now(),
      totalFlips: 0,
      headsFlips: 0,
      tailsFlips: 0,
      longestHeadsStreak: 0,
      longestTailsStreak: 0,
      currentStreak: { type: null, count: 0 },
      flipTimes: [],
      averageFlipTime: 0
    });
  }, []);

  // Update heads/tails count and session stats when result changes
  useEffect(() => {
    if (result === "heads") {
      setHeadsCount((prev) => prev + 1);
      setFlipHistory(prev => [...prev, { result: "heads", timestamp: Date.now() }]);
      
      setSessionStats(prev => {
        const newStats = {
          ...prev,
          totalFlips: prev.totalFlips + 1,
          headsFlips: prev.headsFlips + 1,
          flipTimes: [...prev.flipTimes, Date.now()]
        };
        
        // Update streaks
        if (prev.currentStreak.type === "heads") {
          newStats.currentStreak = { type: "heads", count: prev.currentStreak.count + 1 };
          newStats.longestHeadsStreak = Math.max(prev.longestHeadsStreak, newStats.currentStreak.count);
        } else {
          newStats.currentStreak = { type: "heads", count: 1 };
          newStats.longestHeadsStreak = Math.max(prev.longestHeadsStreak, 1);
        }
        
        return newStats;
      });
    } else if (result === "tails") {
      setTailsCount((prev) => prev + 1);
      setFlipHistory(prev => [...prev, { result: "tails", timestamp: Date.now() }]);
      
      setSessionStats(prev => {
        const newStats = {
          ...prev,
          totalFlips: prev.totalFlips + 1,
          tailsFlips: prev.tailsFlips + 1,
          flipTimes: [...prev.flipTimes, Date.now()]
        };
        
        // Update streaks
        if (prev.currentStreak.type === "tails") {
          newStats.currentStreak = { type: "tails", count: prev.currentStreak.count + 1 };
          newStats.longestTailsStreak = Math.max(prev.longestTailsStreak, newStats.currentStreak.count);
        } else {
          newStats.currentStreak = { type: "tails", count: 1 };
          newStats.longestTailsStreak = Math.max(prev.longestTailsStreak, 1);
        }
        
        return newStats;
      });
    }
  }, [result]);

  // Calculate current streak
  const calculateStreak = useCallback((flips) => {
    if (flips.length === 0) return { type: null, count: 0 };
    
    let currentType = flips[flips.length - 1].result;
    let count = 1;
    
    for (let i = flips.length - 2; i >= 0; i--) {
      if (flips[i].result === currentType) {
        count++;
      } else {
        break;
      }
    }
    
    return { type: currentType, count };
  }, []);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const totalFlips = flipHistory.length;
    const headsPercentage = totalFlips > 0 ? (headsCount / totalFlips) * 100 : 0;
    const tailsPercentage = totalFlips > 0 ? (tailsCount / totalFlips) * 100 : 0;
    const recentFlips = flipHistory.slice(-10);
    const streak = calculateStreak(recentFlips);
    
    // Calculate session duration
    const sessionDuration = Date.now() - sessionStats.startTime;
    const sessionMinutes = Math.floor(sessionDuration / 60000);
    const sessionSeconds = Math.floor((sessionDuration % 60000) / 1000);
    
    // Calculate flip frequency
    const flipFrequency = sessionStats.totalFlips > 0 ? 
      (sessionStats.totalFlips / (sessionDuration / 60000)) : 0;
    
    // Calculate average time between flips
    const averageFlipTime = sessionStats.flipTimes.length > 1 ? 
      sessionStats.flipTimes.slice(1).reduce((acc, time, index) => 
        acc + (time - sessionStats.flipTimes[index]), 0) / (sessionStats.flipTimes.length - 1) : 0;
    
    return {
      totalFlips,
      headsPercentage,
      tailsPercentage,
      streak,
      recentFlips,
      sessionStats,
      sessionDuration: `${sessionMinutes}:${sessionSeconds.toString().padStart(2, '0')}`,
      flipFrequency: flipFrequency.toFixed(2),
      averageFlipTime: Math.round(averageFlipTime / 1000)
    };
  }, [flipHistory, headsCount, tailsCount, calculateStreak, sessionStats]);

  // Export statistics data
  const exportStats = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      sessionStats,
      flipHistory,
      statistics
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `coin-flip-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sessionStats, flipHistory, statistics]);

  // Particle system functions
  const createParticle = useCallback((x, y, type = 'sparkle') => {
    const particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4,
      type,
      color: type === 'gold' ? 0xffd700 : type === 'silver' ? 0xc0c0c0 : 0xffffff,
      alpha: 0.8 + Math.random() * 0.2
    };
    return particle;
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - particle.decay,
        alpha: particle.alpha * (particle.life / 1.0),
        size: particle.size * (particle.life / 1.0)
      })).filter(particle => particle.life > 0)
    );
  }, []);

  // Camera shake effect
  const triggerCameraShake = useCallback((intensity = 10) => {
    setCameraShake({ x: 0, y: 0, intensity });
    const duration = 200;
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        const progress = i / steps;
        const currentIntensity = intensity * (1 - progress);
        const shakeX = (Math.random() - 0.5) * currentIntensity;
        const shakeY = (Math.random() - 0.5) * currentIntensity;
        setCameraShake({ x: shakeX, y: shakeY, intensity: currentIntensity });
      }, i * stepDuration);
    }
  }, []);

  // Coin trail effect
  const updateCoinTrail = useCallback((x, y) => {
    setCoinTrail(prev => {
      const newTrail = [...prev, { x, y, life: 1.0 }];
      return newTrail.slice(-20);
    });
  }, []);

  // Update particle system
  useEffect(() => {
    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, [updateParticles]);

  // Update coin trail
  useEffect(() => {
    if (isFlipping) {
      updateCoinTrail(coinX, coinY);
    } else {
      setCoinTrail([]);
    }
  }, [coinX, coinY, isFlipping, updateCoinTrail]);

  // Simplified background to prevent infinite errors
  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    
    // Static background
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();

    // Simple decorative border
    graphics.setStrokeStyle({ color: 0xffd700, width: 6 });
    graphics.rect(5, 5, 590, 390);
    graphics.stroke();
    
    graphics.setStrokeStyle({ color: 0x3a3a5e, width: 4 });
    graphics.rect(10, 10, 580, 380);
    graphics.stroke();
    
    // Simple corner decorations
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.3 });
    const corners = [[20, 20], [580, 20], [20, 380], [580, 380]];
    corners.forEach(([x, y]) => {
      graphics.circle(x, y, 8);
      graphics.fill();
    });

    // Draw coin trail
    coinTrail.forEach((point, index) => {
      const alpha = Math.max(0, Math.min(1, (index / coinTrail.length) * 0.6));
      graphics.setFillStyle({ color: 0xffd700, alpha });
      graphics.circle(point.x, point.y, 2);
      graphics.fill();
    });

    // Draw particles
    particles.forEach(particle => {
      graphics.setFillStyle({ 
        color: particle.color, 
        alpha: Math.max(0, Math.min(1, particle.alpha))
      });
      graphics.circle(particle.x, particle.y, particle.size);
      graphics.fill();
    });
  }, [coinTrail, particles]);

  // Memoize expensive calculations for better performance
  const coinCalculations = useMemo(() => {
    const currentRotation = hand2X === 600 ? slowFlipRotation : coinRotation;
    const perspective = Math.abs(Math.sin(currentRotation));
    const coinRadius = 35 * coinScale;
    const ellipseHeight = coinRadius * (1 - perspective * 0.7);
    
    return {
      currentRotation,
      perspective,
      coinRadius,
      ellipseHeight,
      face: Math.floor(currentRotation / Math.PI) % 2,
      gradient: perspective < 0.3 ? 0xffd700 : 0xffed4e,
      shadowAlpha: 0.3 + perspective * 0.2,
      highlightVisible: perspective < 0.5,
      sparkleVisible: Math.abs(Math.sin(currentRotation * 2)) > 0.8,
      motionBlurVisible: Math.abs(Math.sin(currentRotation * 3)) > 0.7
    };
  }, [coinRotation, coinScale, slowFlipRotation, hand2X]);

  const drawCoin = useCallback(
    (graphics) => {
      graphics.clear();

      const {
        currentRotation,
        perspective,
        coinRadius,
        ellipseHeight,
        face,
        gradient,
        shadowAlpha,
        highlightVisible,
        sparkleVisible,
        motionBlurVisible
      } = coinCalculations;

      // Draw coin shadow with perspective
      graphics.setFillStyle({
        color: 0x000000,
        alpha: Math.max(0, Math.min(1, shadowAlpha)),
      });
      graphics.ellipse(
        coinX + 2,
        coinY + 5,
        coinRadius * 0.8,
        ellipseHeight * 0.6
      );
      graphics.fill();

      // Draw coin edge (3D effect)
      graphics.setFillStyle({ color: 0xffb000 });
      graphics.ellipse(coinX, coinY, coinRadius, ellipseHeight);
      graphics.fill();

      // Draw coin face with gradient effect
      graphics.setFillStyle({ color: gradient });
      graphics.ellipse(coinX, coinY, coinRadius * 0.9, ellipseHeight * 0.9);
      graphics.fill();

      // Draw coin face based on rotation with perspective
      graphics.setFillStyle({ color: 0x000000 });

      if (face === 0) {
        // Heads - draw a crown with perspective
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const crownScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 12 * crownScale);
        graphics.lineTo(coinX - 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX - 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX - 4 * crownScale, coinY);
        graphics.lineTo(coinX + 4 * crownScale, coinY);
        graphics.lineTo(coinX + 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX + 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX, coinY - 12 * crownScale);
        graphics.stroke();
      } else {
        // Tails - draw a "T" with perspective
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const tScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 12 * tScale);
        graphics.lineTo(coinX, coinY + 12 * tScale);
        graphics.moveTo(coinX - 12 * tScale, coinY);
        graphics.lineTo(coinX + 12 * tScale, coinY);
        graphics.stroke();
      }

      // Enhanced highlight for 3D effect with dynamic lighting
      if (highlightVisible) {
        // Main highlight
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.6 });
        graphics.ellipse(
          coinX - 8,
          coinY - 8,
          coinRadius * 0.3,
          ellipseHeight * 0.3
        );
        graphics.fill();
        
        // Secondary highlight for more realism
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
        graphics.ellipse(
          coinX - 12,
          coinY - 12,
          coinRadius * 0.15,
          ellipseHeight * 0.15
        );
        graphics.fill();
        
        // Add sparkle effect when coin is spinning fast
        if (sparkleVisible) {
          graphics.setFillStyle({ color: 0xffd700, alpha: 0.8 });
          graphics.circle(coinX + 15, coinY - 15, 3);
          graphics.fill();
          
          graphics.setFillStyle({ color: 0xffffff, alpha: 0.9 });
          graphics.circle(coinX + 18, coinY - 12, 2);
          graphics.fill();

          // Create sparkle particles
          if (Math.random() < 0.3) {
            const sparkleParticle = createParticle(coinX + 15, coinY - 15, 'sparkle');
            setParticles(prev => [...prev, sparkleParticle]);
          }
        }
      }
      
      // Add motion blur effect during fast rotation
      if (motionBlurVisible) {
        graphics.setFillStyle({ color: 0xffd700, alpha: 0.2 });
        graphics.ellipse(coinX + 5, coinY, coinRadius * 0.8, ellipseHeight * 0.4);
        graphics.fill();
      }
    },
    [coinCalculations, coinX, coinY, createParticle]
  );

  const drawResultCoin = useCallback((graphics, coinResult) => {
    graphics.clear();

    const coinX = 300;
    const coinY = 250;
    const coinRadius = 30;

    // Draw coin shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
    graphics.circle(coinX + 2, coinY + 3, coinRadius * 0.9);
    graphics.fill();

    // Draw coin edge
    graphics.setFillStyle({ color: 0xffb000 });
    graphics.circle(coinX, coinY, coinRadius);
    graphics.fill();

    // Draw coin face
    graphics.setFillStyle({ color: 0xffd700 });
    graphics.circle(coinX, coinY, coinRadius * 0.9);
    graphics.fill();

    // Draw coin face based on result
    graphics.setFillStyle({ color: 0x000000 });
    graphics.setStrokeStyle({ color: 0x000000, width: 3 });

    if (coinResult === "heads") {
      // Draw crown symbol for heads
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX - 6, coinY - 3);
      graphics.lineTo(coinX - 10, coinY + 3);
      graphics.lineTo(coinX - 3, coinY + 1);
      graphics.lineTo(coinX + 3, coinY + 1);
      graphics.lineTo(coinX + 10, coinY + 3);
      graphics.lineTo(coinX + 6, coinY - 3);
      graphics.lineTo(coinX, coinY - 10);
      graphics.stroke();
    } else {
      // Draw "T" symbol for tails
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX, coinY + 10);
      graphics.moveTo(coinX - 10, coinY);
      graphics.lineTo(coinX + 10, coinY);
      graphics.stroke();
    }

    // Enhanced highlight with multiple layers
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.7 });
    graphics.circle(coinX - 6, coinY - 6, coinRadius * 0.3);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
    graphics.circle(coinX - 8, coinY - 8, coinRadius * 0.15);
    graphics.fill();
    
    // Add celebration sparkles for result
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const distance = coinRadius + 15;
      const sparkleX = coinX + Math.cos(angle) * distance;
      const sparkleY = coinY + Math.sin(angle) * distance;
      
      graphics.setFillStyle({ 
        color: coinResult === "heads" ? 0xffd700 : 0xff6b6b, 
        alpha: 0.8 
      });
      graphics.circle(sparkleX, sparkleY, 2);
      graphics.fill();
      
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.9 });
      graphics.circle(sparkleX + 1, sparkleY - 1, 1);
      graphics.fill();
    }
  }, []);

  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          fontWeight: "bold",
          background: "linear-gradient(45deg, #ffd700, #ff6b6b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "20px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        Advanced Hand Toss Coin Game with Stats
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: "20px", textAlign: "center" }}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          style={{
            display: "inline-block",
            margin: "0 15px",
            padding: "8px 12px",
            backgroundColor: "#1a1a2e",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Total Flips: {score}
        </motion.span>
        
        <motion.span
          whileHover={{ scale: 1.05 }}
          style={{
            display: "inline-block",
            margin: "0 15px",
            padding: "8px 12px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Heads: {headsCount}
        </motion.span>
        
        <motion.span
          whileHover={{ scale: 1.05 }}
          style={{
            display: "inline-block",
            margin: "0 15px",
            padding: "8px 12px",
            backgroundColor: "#ff6b6b",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Tails: {tailsCount}
        </motion.span>
        
        <motion.div
          style={{ marginTop: "15px", fontSize: "18px", fontWeight: "bold" }}
          animate={{
            color: isFlipping ? "#ff9800" : result ? "#4CAF50" : "#2196f3"
          }}
          transition={{ duration: 0.3 }}
        >
          {!isFlipping && !result && "🎯 Click the coin to flip!"}
          {isFlipping && "🔄 Flipping..."}
          {result && `🎉 Result: ${result.toUpperCase()}!`}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        <motion.button
          onClick={flipCoin}
          disabled={isFlipping}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: isFlipping ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: isFlipping ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {isFlipping ? "🔄 Flipping..." : "🎯 Flip Coin"}
        </motion.button>
        
        <motion.button
          onClick={resetGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          🔄 Reset
        </motion.button>
        
        <motion.button
          onClick={testHand22Movement}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          ✋ Test Hand
        </motion.button>

        <motion.button
          onClick={() => setSlowMotionMode(!slowMotionMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: slowMotionMode ? "#e91e63" : "#9c27b0",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {slowMotionMode ? "⏸️ Normal Speed" : "🎬 Slow Motion"}
        </motion.button>

        <motion.button
          onClick={() => setShowStats(!showStats)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: showStats ? "#ff5722" : "#607d8b",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {showStats ? "📊 Hide Stats" : "📊 Show Stats"}
        </motion.button>

        <motion.button
          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: showAdvancedStats ? "#673ab7" : "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {showAdvancedStats ? "📈 Hide Advanced" : "📈 Advanced Stats"}
        </motion.button>

        <motion.button
          onClick={exportStats}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "12px 20px",
            backgroundColor: "#795548",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          💾 Export Stats
        </motion.button>
        
        <AnimatePresence>
          {showResultEnabled && (
            <motion.button
              key="showResult"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={showResult}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                margin: "0 8px",
                padding: "12px 20px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              👁️ Show Result
            </motion.button>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {tryAgainEnabled && (
            <motion.button
              key="tryAgain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={tryAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                margin: "0 8px",
                padding: "12px 20px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              🔄 Try Again
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <motion.div
          animate={{
            x: cameraShake.x,
            y: cameraShake.y,
          }}
          transition={{ duration: 0.1, ease: "linear" }}
        >
          <Application
            width={600}
            height={400}
            eventMode="static"
            onClick={flipCoin}
            style={{
              outline: "none",
              cursor: "pointer",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "3px solid #ffd700",
              overflow: "hidden",
              transform: `translate(${cameraShake.x}px, ${cameraShake.y}px)`,
            }}
          >
            <HandTossCoinChild
              coinRotation={coinRotation}
              isFlipping={isFlipping}
              result={result}
              setCoinRotation={setCoinRotation}
              setCoinScale={setCoinScale}
              setCoinY={setCoinY}
              setCoinX={setCoinX}
              setIsFlipping={setIsFlipping}
              drawCoin={drawCoin}
              drawBackground={drawBackground}
              drawResultCoin={drawResultCoin}
              handTexture={handTexture}
              hand2Texture={hand2Texture}
              hand3Texture={hand3Texture}
              showCoin={showCoin}
              hand2X={hand2X}
              setHand2X={setHand2X}
              hand2Moving={hand2Moving}
              setHand2Moving={setHand2Moving}
              showHand33={showHand33}
              setShowHand33={setShowHand33}
              setCoinResult={setCoinResult}
              setShowResultEnabled={setShowResultEnabled}
              setTryAgainEnabled={setTryAgainEnabled}
              showResultEnabled={showResultEnabled}
              tryAgainEnabled={tryAgainEnabled}
              coinResult={coinResult}
              slowFlipRotation={slowFlipRotation}
              setSlowFlipRotation={setSlowFlipRotation}
              setShowCoin={setShowCoin}
              coinTrail={coinTrail}
              particles={particles}
              createParticle={createParticle}
              setParticles={setParticles}
              slowMotionMode={slowMotionMode}
            />
          </Application>
        </motion.div>
      </motion.div>

      {/* Environment Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ textAlign: "center", marginTop: "20px" }}
      >
        <motion.button
          onClick={() => setEnvironmentEffects(prev => ({ 
            ...prev, 
            wind: prev.wind > 0 ? 0 : 0.5 
          }))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "10px 16px",
            backgroundColor: environmentEffects.wind > 0 ? "#87ceeb" : "#666",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          🌪️ Wind: {environmentEffects.wind > 0 ? "ON" : "OFF"}
        </motion.button>

        <motion.button
          onClick={() => setEnvironmentEffects(prev => ({ 
            ...prev, 
            lighting: prev.lighting > 0.5 ? 0.3 : 1 
          }))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "10px 16px",
            backgroundColor: environmentEffects.lighting > 0.5 ? "#ffd700" : "#444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          💡 Lighting: {environmentEffects.lighting > 0.5 ? "BRIGHT" : "DIM"}
        </motion.button>

        <motion.button
          onClick={() => setEnvironmentEffects(prev => ({ 
            ...prev, 
            atmosphere: prev.atmosphere > 0 ? 0 : 0.8 
          }))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            margin: "0 8px",
            padding: "10px 16px",
            backgroundColor: environmentEffects.atmosphere > 0 ? "#9b59b6" : "#666",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          ✨ Magic: {environmentEffects.atmosphere > 0 ? "ON" : "OFF"}
        </motion.button>
      </motion.div>

      {/* Basic Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              margin: "20px auto",
              maxWidth: "800px",
              backgroundColor: "#1a1a2e",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: "2px solid #ffd700",
            }}
          >
            <h3 style={{ 
              color: "#ffd700", 
              textAlign: "center", 
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "bold"
            }}>
              📊 Flip Statistics
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              {/* Total Flips */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4CAF50" }}>
                  {statistics.totalFlips}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Total Flips</div>
              </motion.div>

              {/* Heads Percentage */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ffd700" }}>
                  {statistics.headsPercentage.toFixed(1)}%
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Heads</div>
              </motion.div>

              {/* Tails Percentage */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ff6b6b" }}>
                  {statistics.tailsPercentage.toFixed(1)}%
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Tails</div>
              </motion.div>

              {/* Current Streak */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ 
                  fontSize: "32px", 
                  fontWeight: "bold", 
                  color: statistics.streak.type === "heads" ? "#ffd700" : "#ff6b6b" 
                }}>
                  {statistics.streak.count}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>
                  {statistics.streak.type ? `${statistics.streak.type} streak` : "No streak"}
                </div>
              </motion.div>
            </div>

            {/* Recent Flips */}
            {statistics.recentFlips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: "20px" }}
              >
                <h4 style={{ color: "#ffd700", marginBottom: "12px", textAlign: "center" }}>
                  Recent Flips
                </h4>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  gap: "8px",
                  flexWrap: "wrap"
                }}>
                  {statistics.recentFlips.map((flip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: flip.result === "heads" ? "#ffd700" : "#ff6b6b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#000",
                        border: "2px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                      }}
                    >
                      {flip.result === "heads" ? "👑" : "T"}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Statistics Panel */}
      <AnimatePresence>
        {showAdvancedStats && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              margin: "20px auto",
              maxWidth: "1000px",
              backgroundColor: "#1a1a2e",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: "2px solid #3f51b5",
            }}
          >
            <h3 style={{ 
              color: "#3f51b5", 
              textAlign: "center", 
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "bold"
            }}>
              📈 Advanced Statistics
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {/* Session Duration */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2196f3" }}>
                  {statistics.sessionDuration}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Session Duration</div>
              </motion.div>

              {/* Flip Frequency */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff9800" }}>
                  {statistics.flipFrequency}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Flips per Minute</div>
              </motion.div>

              {/* Average Flip Time */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4caf50" }}>
                  {statistics.averageFlipTime}s
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Avg Time Between Flips</div>
              </motion.div>

              {/* Longest Heads Streak */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffd700" }}>
                  {statistics.sessionStats.longestHeadsStreak}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Longest Heads Streak</div>
              </motion.div>

              {/* Longest Tails Streak */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff6b6b" }}>
                  {statistics.sessionStats.longestTailsStreak}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>Longest Tails Streak</div>
              </motion.div>

              {/* Current Session Streak */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  backgroundColor: "#2a2a4e",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid #3a3a5e"
                }}
              >
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: "bold", 
                  color: statistics.sessionStats.currentStreak.type === "heads" ? "#ffd700" : "#ff6b6b" 
                }}>
                  {statistics.sessionStats.currentStreak.count}
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>
                  Current {statistics.sessionStats.currentStreak.type || "No"} Streak
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedHandTossCoinWithStats;
