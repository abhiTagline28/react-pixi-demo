import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const PhysicsController = ({ setAnimationTime, setParticles, isRunning, gravity, bounce, friction, wind }) => {
  useTick(() => {
    setAnimationTime(prev => prev + 0.1);
    
    if (isRunning) {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Apply gravity
          particle.vy += gravity;
          
          // Apply wind
          particle.vx += wind * 0.01;
          
          // Apply friction
          particle.vx *= friction;
          particle.vy *= friction;
          
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Bounce off walls
          if (particle.x <= particle.radius || particle.x >= 800 - particle.radius) {
            particle.vx *= -bounce;
            particle.x = particle.x <= particle.radius ? particle.radius : 800 - particle.radius;
          }
          
          if (particle.y <= particle.radius || particle.y >= 500 - particle.radius) {
            particle.vy *= -bounce;
            particle.y = particle.y <= particle.radius ? particle.radius : 500 - particle.radius;
          }
          
          // Update age
          particle.age += 1;
          
          // Remove old particles
          if (particle.age > 1000) {
            return null;
          }
          
          return particle;
        }).filter(particle => particle !== null)
      );
    }
  });
  
  return null;
};

const PhysicsSimulation = () => {
  const [particles, setParticles] = useState([]);
  const [gravity, setGravity] = useState(0.5);
  const [bounce, setBounce] = useState(0.8);
  const [friction, setFriction] = useState(0.99);
  const [isRunning, setIsRunning] = useState(true);
  const [wind, setWind] = useState(0);
  const [animationTime, setAnimationTime] = useState(0);

  const createParticle = useCallback((x, y, vx = 0, vy = 0) => {
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7, 0xfd79a8];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      vx: vx + (Math.random() - 0.5) * 4,
      vy: vy + (Math.random() - 0.5) * 4,
      radius: Math.random() * 8 + 4,
      color: color,
      age: 0,
      mass: Math.random() * 2 + 1,
    };
  }, []);

  const addParticle = useCallback((event) => {
    if (event.data) {
      const position = event.data.getLocalPosition(event.currentTarget);
      const newParticle = createParticle(position.x, position.y);
      setParticles(prev => [...prev, newParticle]);
    }
  }, [createParticle]);

  const addRandomParticles = useCallback(() => {
    const newParticles = [];
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 700 + 50;
      const y = Math.random() * 300 + 50;
      newParticles.push(createParticle(x, y));
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, [createParticle]);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  const drawParticles = useCallback((graphics) => {
    graphics.clear();
    
    particles.forEach(particle => {
      // Particle shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
      graphics.circle(particle.x + 2, particle.y + 2, particle.radius);
      graphics.fill();
      
      // Particle
      graphics.setFillStyle({ color: particle.color });
      graphics.circle(particle.x, particle.y, particle.radius);
      graphics.fill();
      
      // Particle border
      graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
      graphics.circle(particle.x, particle.y, particle.radius);
      graphics.stroke();
      
      // Velocity indicator
      graphics.setStrokeStyle({ color: 0xffffff, alpha: 0.5, width: 1 });
      graphics.moveTo(particle.x, particle.y);
      graphics.lineTo(particle.x + particle.vx * 2, particle.y + particle.vy * 2);
      graphics.stroke();
    });
  }, [particles]);

  const drawSpring = useCallback((graphics, p1, p2, restLength = 50) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = (distance - restLength) * 0.1;
    
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    
    // Update velocities
    p1.vx += fx / p1.mass;
    p1.vy += fy / p1.mass;
    p2.vx -= fx / p2.mass;
    p2.vy -= fy / p2.mass;
    
    // Draw spring
    graphics.setStrokeStyle({ color: 0x00ff88, width: 2 });
    graphics.moveTo(p1.x, p1.y);
    graphics.lineTo(p2.x, p2.y);
    graphics.stroke();
  }, []);

  const drawSpringSystem = useCallback((graphics) => {
    graphics.clear();
    
    // Create spring connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          drawSpring(graphics, p1, p2, 50);
        }
      }
    }
  }, [particles, drawSpring]);

  const drawForceField = useCallback((graphics) => {
    graphics.clear();
    
    const centerX = 400;
    const centerY = 250;
    const forceRadius = 100;
    
    // Draw force field
    graphics.setStrokeStyle({ color: 0xff6b6b, alpha: 0.5, width: 2 });
    graphics.circle(centerX, centerY, forceRadius);
    graphics.stroke();
    
    // Apply force to particles
    particles.forEach(particle => {
      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < forceRadius && distance > 0) {
        const force = (forceRadius - distance) / forceRadius * 0.5;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      }
    });
  }, [particles]);

  const drawWaterSimulation = useCallback((graphics) => {
    graphics.clear();
    
    const waterLevel = 400;
    const waveAmplitude = 20;
    
    // Draw water surface
    graphics.setFillStyle({ color: 0x4ecdc4, alpha: 0.7 });
    graphics.rect(0, waterLevel, 800, 100);
    graphics.fill();
    
    // Draw wave
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.moveTo(0, waterLevel + Math.sin(animationTime) * waveAmplitude);
    
    for (let x = 0; x <= 800; x += 10) {
      const y = waterLevel + Math.sin(animationTime + x * 0.02) * waveAmplitude;
      graphics.lineTo(x, y);
    }
    graphics.stroke();
    
    // Apply water resistance to particles
    particles.forEach(particle => {
      if (particle.y > waterLevel) {
        particle.vx *= 0.95; // Water resistance
        particle.vy *= 0.9;
        
        // Buoyancy
        particle.vy -= 0.2;
      }
    });
  }, [particles, animationTime]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setParticles([]);
    setGravity(0.5);
    setBounce(0.8);
    setFriction(0.99);
    setWind(0);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Physics Simulation Engine
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleSimulation}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isRunning ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button 
          onClick={addRandomParticles}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Particles
        </button>
        <button 
          onClick={clearParticles}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
        <button 
          onClick={resetSimulation}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#6c757d' }}>
          Gravity: {gravity.toFixed(1)}
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <label style={{ color: '#6c757d' }}>
          Bounce: {bounce.toFixed(1)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bounce}
            onChange={(e) => setBounce(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <label style={{ color: '#6c757d' }}>
          Friction: {friction.toFixed(2)}
          <input
            type="range"
            min="0.9"
            max="1"
            step="0.01"
            value={friction}
            onChange={(e) => setFriction(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <label style={{ color: '#6c757d' }}>
          Wind: {wind.toFixed(1)}
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={wind}
            onChange={(e) => setWind(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <div style={{ 
        width: '800px', 
        height: '500px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={800} height={500} backgroundColor={0x1a1a2e}>
          <PhysicsController 
            setAnimationTime={setAnimationTime}
            setParticles={setParticles}
            isRunning={isRunning}
            gravity={gravity}
            bounce={bounce}
            friction={friction}
            wind={wind}
          />
          {/* Background */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x1a1a2e });
              graphics.rect(0, 0, 800, 500);
              graphics.fill();
            }}
          />
          
          {/* Title */}
          <pixiText
            text="Physics Simulation - Click to add particles"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0xffffff,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={400}
            y={30}
            anchor={0.5}
          />
          
          {/* Water Simulation */}
          <pixiGraphics draw={drawWaterSimulation} />
          
          {/* Force Field */}
          <pixiGraphics draw={drawForceField} />
          
          {/* Spring System */}
          <pixiGraphics draw={drawSpringSystem} />
          
          {/* Particles */}
          <pixiGraphics draw={drawParticles} />
          
          {/* Interactive Click Area */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
              graphics.rect(0, 0, 800, 500);
              graphics.fill();
            }}
            interactive={true}
            pointerdown={addParticle}
          />
          
          {/* Info Panel */}
          <pixiContainer x={20} y={450}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
                graphics.rect(0, 0, 200, 40);
                graphics.fill();
              }}
            />
            <pixiText
              text={`Particles: ${particles.length}`}
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
              text={`Status: ${isRunning ? 'Running' : 'Paused'}`}
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
          
          {/* Instructions */}
          <pixiContainer x={400} y={450}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
                graphics.rect(0, 0, 200, 40);
                graphics.fill();
              }}
            />
            <pixiText
              text="Click to add particles"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={100}
              y={20}
              anchor={0.5}
            />
          </pixiContainer>
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Physics Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Real Physics:</strong> Gravity, friction, bounce, and wind forces</li>
          <li><strong>Particle System:</strong> Individual particle properties and behaviors</li>
          <li><strong>Spring System:</strong> Connected particles with spring forces</li>
          <li><strong>Force Fields:</strong> Attractive forces affecting particle movement</li>
          <li><strong>Water Simulation:</strong> Buoyancy and water resistance effects</li>
          <li><strong>Interactive Controls:</strong> Adjustable physics parameters in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default PhysicsSimulation;