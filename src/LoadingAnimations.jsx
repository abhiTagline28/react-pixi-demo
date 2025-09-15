import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Text,
});

const SpinnerLoader = ({ x, y, size = 40, color = 0x007bff }) => {
  const [rotation, setRotation] = useState(0);

  useTick(() => {
    setRotation(prev => prev + 0.1);
  });

  const drawSpinner = useCallback((graphics) => {
    graphics.clear();
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 4;
    
    // Draw spinner arc
    graphics.setStrokeStyle({ color: color, width: 4 });
    graphics.arc(centerX, centerY, radius, rotation, rotation + Math.PI * 1.5);
    graphics.stroke();
    
    // Draw background circle
    graphics.setStrokeStyle({ color: color, alpha: 0.2, width: 4 });
    graphics.circle(centerX, centerY, radius);
    graphics.stroke();
  }, [x, y, size, color, rotation]);

  return <pixiGraphics draw={drawSpinner} />;
};

const PulseLoader = ({ x, y, size = 40, color = 0x28a745 }) => {
  const [scale, setScale] = useState(1);
  const [alpha, setAlpha] = useState(1);

  useTick(() => {
    setScale(prev => {
      const newScale = 1 + Math.sin(Date.now() * 0.005) * 0.3;
      return newScale;
    });
    
    setAlpha(prev => {
      const newAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
      return newAlpha;
    });
  });

  const drawPulse = useCallback((graphics) => {
    graphics.clear();
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = (size / 2) * scale;
    
    graphics.setFillStyle({ color: color, alpha: alpha });
    graphics.circle(centerX, centerY, radius);
    graphics.fill();
  }, [x, y, size, color, scale, alpha]);

  return <pixiGraphics draw={drawPulse} />;
};

const WaveLoader = ({ x, y, width = 200, height = 40, color = 0xffc107 }) => {
  const [time, setTime] = useState(0);

  useTick(() => {
    setTime(prev => prev + 0.1);
  });

  const drawWave = useCallback((graphics) => {
    graphics.clear();
    
    graphics.setStrokeStyle({ color: color, width: 3 });
    
    const waveCount = 4;
    const waveLength = width / waveCount;
    
    for (let i = 0; i < waveCount; i++) {
      const waveX = x + i * waveLength;
      const waveY = y + height / 2 + Math.sin(time + i * 2) * 15;
      
      graphics.moveTo(waveX, waveY);
      graphics.lineTo(waveX + waveLength, waveY);
    }
    graphics.stroke();
  }, [x, y, width, height, color, time]);

  return <pixiGraphics draw={drawWave} />;
};

const DotsLoader = ({ x, y, count = 3, color = 0xdc3545 }) => {
  const [time, setTime] = useState(0);

  useTick(() => {
    setTime(prev => prev + 0.1);
  });

  const drawDots = useCallback((graphics) => {
    graphics.clear();
    
    const dotSize = 8;
    const spacing = 20;
    const startX = x - (count - 1) * spacing / 2;
    
    for (let i = 0; i < count; i++) {
      const dotX = startX + i * spacing;
      const dotY = y + Math.sin(time + i * 0.5) * 10;
      const alpha = 0.3 + Math.sin(time + i * 0.5) * 0.7;
      
      graphics.setFillStyle({ color: color, alpha: alpha });
      graphics.circle(dotX, dotY, dotSize);
      graphics.fill();
    }
  }, [x, y, count, color, time]);

  return <pixiGraphics draw={drawDots} />;
};

const ProgressLoader = ({ x, y, width = 200, height = 20, progress, animated = true }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [shimmerOffset, setShimmerOffset] = useState(0);

  useTick(() => {
    if (animated) {
      if (animatedProgress < progress) {
        setAnimatedProgress(prev => Math.min(progress, prev + 1));
      }
      
      setShimmerOffset(prev => (prev + 2) % (width + 40));
    }
  });

  const currentProgress = animated ? animatedProgress : progress;

  const drawProgress = useCallback((graphics) => {
    graphics.clear();
    
    // Background
    graphics.setFillStyle({ color: 0xe9ecef });
    graphics.rect(x, y, width, height);
    graphics.fill();
    
    // Progress fill
    const fillWidth = (currentProgress / 100) * width;
    graphics.setFillStyle({ color: 0x007bff });
    graphics.rect(x, y, fillWidth, height);
    graphics.fill();
    
    // Shimmer effect
    if (animated && currentProgress > 0) {
      const shimmerX = x + shimmerOffset - 20;
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
      graphics.rect(shimmerX, y, 20, height);
      graphics.fill();
    }
    
    // Border
    graphics.setStrokeStyle({ color: 0xdee2e6, width: 1 });
    graphics.rect(x, y, width, height);
    graphics.stroke();
  }, [x, y, width, height, currentProgress, animated, shimmerOffset]);

  const textStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 12,
    fontWeight: "bold",
    fill: 0x007bff,
    align: "center"
  });

  return (
    <>
      <pixiGraphics draw={drawProgress} />
      <pixiText
        text={`${Math.round(currentProgress)}%`}
        style={textStyle}
        x={x + width / 2}
        y={y + height + 5}
        anchor={0.5}
      />
    </>
  );
};

const SkeletonLoader = ({ x, y, width, height, animated = true }) => {
  const [shimmerOffset, setShimmerOffset] = useState(0);

  useTick(() => {
    if (animated) {
      setShimmerOffset(prev => (prev + 3) % (width + 40));
    }
  });

  const drawSkeleton = useCallback((graphics) => {
    graphics.clear();
    
    // Background
    graphics.setFillStyle({ color: 0xf8f9fa });
    graphics.rect(x, y, width, height);
    graphics.fill();
    
    // Shimmer effect
    if (animated) {
      const shimmerX = x + shimmerOffset - 20;
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.6 });
      graphics.rect(shimmerX, y, 20, height);
      graphics.fill();
    }
    
    // Border
    graphics.setStrokeStyle({ color: 0xe9ecef, width: 1 });
    graphics.rect(x, y, width, height);
    graphics.stroke();
  }, [x, y, width, height, animated, shimmerOffset]);

  return <pixiGraphics draw={drawSkeleton} />;
};

const LoadingAnimationsChild = ({ 
  progressValue, 
  showSkeletons 
}) => {
  return (
    <>
      {/* Spinner Loaders */}
      <SpinnerLoader x={50} y={50} size={40} color={0x007bff} />
      <SpinnerLoader x={120} y={50} size={50} color={0x28a745} />
      <SpinnerLoader x={200} y={50} size={35} color={0xffc107} />
      
      {/* Pulse Loaders */}
      <PulseLoader x={50} y={120} size={40} color={0x28a745} />
      <PulseLoader x={120} y={120} size={50} color={0xdc3545} />
      <PulseLoader x={200} y={120} size={35} color={0x6f42c1} />
      
      {/* Wave Loaders */}
      <WaveLoader x={50} y={190} width={150} height={30} color={0xffc107} />
      <WaveLoader x={220} y={190} width={120} height={25} color={0x17a2b8} />
      
      {/* Dots Loaders */}
      <DotsLoader x={50} y={250} count={3} color={0xdc3545} />
      <DotsLoader x={150} y={250} count={4} color={0x6f42c1} />
      <DotsLoader x={250} y={250} count={5} color={0x28a745} />
      
      {/* Progress Loaders */}
      <ProgressLoader 
        x={50} 
        y={300} 
        width={200} 
        height={20} 
        progress={progressValue} 
        animated={true} 
      />
      
      {/* Skeleton Loaders */}
      {showSkeletons && (
        <>
          <SkeletonLoader x={50} y={350} width={200} height={20} animated={true} />
          <SkeletonLoader x={50} y={380} width={150} height={20} animated={true} />
          <SkeletonLoader x={50} y={410} width={180} height={20} animated={true} />
        </>
      )}
    </>
  );
};

const LoadingAnimations = () => {
  const [progressValue, setProgressValue] = useState(0);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgressValue(0);
  }, []);

  const toggleSkeletons = useCallback(() => {
    setShowSkeletons(prev => !prev);
  }, []);

  const titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    fill: 0x212529,
    align: "center"
  });

  return (
    <>
      <h1>Loading Animations & Transitions</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={startLoading}
          disabled={isLoading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Start Loading'}
        </button>
        
        <button 
          onClick={toggleSkeletons}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: showSkeletons ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
        </button>
      </div>

      <Application 
        width={400} 
        height={450}
        style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
      >
        <LoadingAnimationsChild 
          progressValue={progressValue}
          showSkeletons={showSkeletons}
        />
      </Application>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Animation Types:</strong></p>
        <ul>
          <li><strong>Spinner:</strong> Rotating arc with customizable colors and sizes</li>
          <li><strong>Pulse:</strong> Scaling circle with alpha animation</li>
          <li><strong>Wave:</strong> Animated sine wave patterns</li>
          <li><strong>Dots:</strong> Bouncing dots with staggered animation</li>
          <li><strong>Progress:</strong> Animated progress bar with shimmer effect</li>
          <li><strong>Skeleton:</strong> Content placeholder with shimmer loading</li>
        </ul>
        
        <div style={{ marginTop: '15px' }}>
          <strong>Current Progress:</strong> {Math.round(progressValue)}%
        </div>
      </div>
    </>
  );
};

export default LoadingAnimations;
