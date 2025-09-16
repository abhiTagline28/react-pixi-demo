import React, { useState, useCallback } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const AnimationController = ({ setAnimationTime, isPlaying, animationSpeed }) => {
  useTick(() => {
    if (isPlaying) {
      setAnimationTime(prev => prev + 0.1 * animationSpeed);
    }
  });
  
  return null;
};

const RealisticAnimations = () => {
  const [animationType, setAnimationType] = useState('floating');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [particleCount, setParticleCount] = useState(50);
  const [animationTime, setAnimationTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const drawFloatingParticles = useCallback((graphics) => {
    graphics.clear();
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i * 37) % 800;
      const y = 100 + Math.sin(animationTime + i * 0.5) * 30 + Math.cos(animationTime * 0.7 + i * 0.3) * 20;
      const size = 2 + Math.sin(animationTime + i) * 1;
      const alpha = 0.3 + Math.sin(animationTime * 2 + i) * 0.4;
      
      graphics.setFillStyle({ color: 0x4ecdc4, alpha: alpha });
      graphics.circle(x, y, size);
      graphics.fill();
      
      // Glow effect
      graphics.setFillStyle({ color: 0x4ecdc4, alpha: alpha * 0.3 });
      graphics.circle(x, y, size * 2);
      graphics.fill();
    }
  }, [particleCount, animationTime]);

  const drawWaveAnimation = useCallback((graphics) => {
    graphics.clear();
    
    const waveCount = 3;
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1];
    
    for (let wave = 0; wave < waveCount; wave++) {
      graphics.setStrokeStyle({ color: colors[wave], width: 3 });
      graphics.moveTo(0, 200 + wave * 50);
      
      for (let x = 0; x <= 800; x += 4) {
        const y = 200 + wave * 50 + Math.sin(x * 0.02 + animationTime * 2 + wave) * 30;
        graphics.lineTo(x, y);
      }
      graphics.stroke();
    }
  }, [animationTime]);

  const getCurrentAnimation = useCallback(() => {
    switch (animationType) {
      case 'floating':
        return drawFloatingParticles;
      case 'wave':
        return drawWaveAnimation;
      default:
        return drawFloatingParticles;
    }
  }, [animationType, drawFloatingParticles, drawWaveAnimation]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setAnimationTime(0);
  };

  const animationTypes = [
    { id: 'floating', name: 'Floating Particles', description: 'Gentle floating particles with glow effects' },
    { id: 'wave', name: 'Wave Animation', description: 'Multiple sine waves with animated particles' },
  ];

  const currentAnimationInfo = animationTypes.find(anim => anim.id === animationType);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Realistic Animation Effects
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleAnimation}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isPlaying ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={resetAnimation}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <span style={{ marginLeft: '20px', color: '#6c757d' }}>
          Time: {animationTime.toFixed(1)}s | Status: {isPlaying ? 'Playing' : 'Paused'}
        </span>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#6c757d' }}>
          Speed: {animationSpeed.toFixed(1)}x
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <label style={{ color: '#6c757d' }}>
          Particles: {particleCount}
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          width: '600px', 
          height: '400px', 
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Application width={600} height={400} backgroundColor={0x1a1a2e}>
            <AnimationController 
              setAnimationTime={setAnimationTime}
              isPlaying={isPlaying}
              animationSpeed={animationSpeed}
            />
            {/* Background */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x1a1a2e });
                graphics.rect(0, 0, 600, 400);
                graphics.fill();
              }}
            />
            
            {/* Title */}
            <pixiText
              text={currentAnimationInfo?.name || 'Animation'}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={300}
              y={30}
              anchor={0.5}
            />
            
            {/* Animation */}
            <pixiGraphics draw={getCurrentAnimation()} />
            
            {/* Info Panel */}
            <pixiContainer x={20} y={350}>
              <pixiGraphics
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
                  graphics.rect(0, 0, 200, 40);
                  graphics.fill();
                }}
              />
              <pixiText
                text={`FPS: ${Math.round(60 / animationSpeed)}`}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={10}
                y={10}
                anchor={0}
              />
              <pixiText
                text={`Particles: ${particleCount}`}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={10}
                y={25}
                anchor={0}
              />
            </pixiContainer>
          </Application>
        </div>
        
        {/* Animation Selection Panel */}
        <div style={{ 
          width: '300px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Animation Types</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {animationTypes.map(anim => (
              <button
                key={anim.id}
                onClick={() => setAnimationType(anim.id)}
                style={{
                  padding: '12px',
                  backgroundColor: animationType === anim.id ? '#007bff' : '#ffffff',
                  color: animationType === anim.id ? 'white' : '#333333',
                  border: `2px solid ${animationType === anim.id ? '#0056b3' : '#dee2e6'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ marginBottom: '5px' }}>{anim.name}</div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'normal',
                  opacity: 0.8
                }}>
                  {anim.description}
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
            <p><strong>Current Animation:</strong></p>
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#e9ecef', 
              borderRadius: '4px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#495057' }}>
                {currentAnimationInfo?.name}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                {currentAnimationInfo?.description}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Animation Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Floating Particles:</strong> Gentle movement with glow effects and alpha blending</li>
          <li><strong>Wave Animation:</strong> Multiple sine waves with synchronized particle movement</li>
          <li><strong>Real-time Controls:</strong> Adjust speed and particle count dynamically</li>
          <li><strong>Smooth Performance:</strong> Optimized rendering with 60fps target</li>
        </ul>
      </div>
    </div>
  );
};

export default RealisticAnimations;