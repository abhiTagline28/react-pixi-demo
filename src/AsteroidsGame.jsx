import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Text,
});

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_SIZE = 20;
const ASTEROID_MIN_SIZE = 20;
const ASTEROID_MAX_SIZE = 60;
const BULLET_SPEED = 8;
const PLAYER_SPEED = 3;
const PLAYER_ROTATION_SPEED = 0.1;
const ASTEROID_SPEED = 1;

const AsteroidsGameChild = ({
  gameState,
  player,
  bullets,
  asteroids,
  particles,
  score,
  lives,
  level,
  setGameState,
  setPlayer,
  setBullets,
  setAsteroids,
  setParticles,
  setScore,
  setLives,
  setLevel,
  drawBackground,
  drawPlayer,
  drawBullets,
  drawAsteroids,
  drawParticles,
  drawUI
}) => {
  const [frameCount, setFrameCount] = useState(0);

  useTick(() => {
    if (gameState === 'playing') {
      setFrameCount(prev => prev + 1);
      
      // Move bullets
      if (frameCount % 2 === 0) {
        setBullets(prevBullets => 
          prevBullets.filter(bullet => {
            const newX = bullet.x + bullet.vx;
            const newY = bullet.y + bullet.vy;
            
            // Wrap around screen
            bullet.x = newX < 0 ? GAME_WIDTH : newX > GAME_WIDTH ? 0 : newX;
            bullet.y = newY < 0 ? GAME_HEIGHT : newY > GAME_HEIGHT ? 0 : newY;
            
            bullet.life--;
            return bullet.life > 0;
          })
        );
      }
      
      // Move asteroids
      if (frameCount % 3 === 0) {
        setAsteroids(prevAsteroids => 
          prevAsteroids.map(asteroid => {
            const newX = asteroid.x + asteroid.vx;
            const newY = asteroid.y + asteroid.vy;
            
            // Wrap around screen
            asteroid.x = newX < -asteroid.size ? GAME_WIDTH + asteroid.size : 
                        newX > GAME_WIDTH + asteroid.size ? -asteroid.size : newX;
            asteroid.y = newY < -asteroid.size ? GAME_HEIGHT + asteroid.size : 
                        newY > GAME_HEIGHT + asteroid.size ? -asteroid.size : newY;
            
            asteroid.rotation += asteroid.rotationSpeed;
            return asteroid;
          })
        );
      }
      
      // Move particles
      if (frameCount % 2 === 0) {
        setParticles(prevParticles => 
          prevParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
          })
        );
      }
      
      // Check collisions
      checkCollisions();
      
      // Spawn new asteroids if none left
      if (asteroids.length === 0) {
        spawnAsteroids(level + 1);
        setLevel(prev => prev + 1);
      }
      
      // Check game over
      if (lives <= 0) {
        setGameState('gameOver');
      }
    }
  });

  const checkCollisions = () => {
    // Bullet vs Asteroid collisions
    setBullets(prevBullets => {
      const newBullets = [...prevBullets];
      const bulletsToRemove = [];
      
      prevBullets.forEach((bullet, bulletIndex) => {
        asteroids.forEach((asteroid, asteroidIndex) => {
          const dx = bullet.x - asteroid.x;
          const dy = bullet.y - asteroid.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < asteroid.size) {
            bulletsToRemove.push(bulletIndex);
            
            // Create explosion particles
            createExplosion(asteroid.x, asteroid.y, asteroid.size);
            
            // Split asteroid or remove it
            if (asteroid.size > ASTEROID_MIN_SIZE) {
              splitAsteroid(asteroid);
            }
            
            setAsteroids(prev => prev.filter((_, index) => index !== asteroidIndex));
            setScore(prev => prev + Math.floor(100 / asteroid.size));
          }
        });
      });
      
      return newBullets.filter((_, index) => !bulletsToRemove.includes(index));
    });
    
    // Player vs Asteroid collisions
    asteroids.forEach((asteroid, asteroidIndex) => {
      const dx = player.x - asteroid.x;
      const dy = player.y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < PLAYER_SIZE / 2 + asteroid.size) {
        // Player hit
        createExplosion(player.x, player.y, PLAYER_SIZE);
        setLives(prev => prev - 1);
        setAsteroids(prev => prev.filter((_, index) => index !== asteroidIndex));
        
        // Reset player position
        setPlayer(prev => ({
          ...prev,
          x: GAME_WIDTH / 2,
          y: GAME_HEIGHT / 2,
          vx: 0,
          vy: 0
        }));
      }
    });
  };

  const createExplosion = (x, y, size) => {
    const particleCount = Math.floor(size / 5);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 3 + 1;
      
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        alpha: 1,
        size: Math.random() * 3 + 1
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const splitAsteroid = (asteroid) => {
    const newAsteroids = [];
    const newSize = asteroid.size / 2;
    
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * ASTEROID_SPEED + 0.5;
      
      newAsteroids.push({
        x: asteroid.x,
        y: asteroid.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: newSize,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        vertices: generateAsteroidVertices(newSize)
      });
    }
    
    setAsteroids(prev => [...prev, ...newAsteroids]);
  };

  const generateAsteroidVertices = (size) => {
    const vertices = [];
    const vertexCount = Math.floor(Math.random() * 4) + 6;
    
    for (let i = 0; i < vertexCount; i++) {
      const angle = (Math.PI * 2 * i) / vertexCount;
      const radius = size + Math.random() * size * 0.3;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    
    return vertices;
  };

  const spawnAsteroids = (count) => {
    const newAsteroids = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * ASTEROID_SPEED + 0.5;
      
      // Spawn at edge of screen
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      switch (side) {
        case 0: // Top
          x = Math.random() * GAME_WIDTH;
          y = -size;
          break;
        case 1: // Right
          x = GAME_WIDTH + size;
          y = Math.random() * GAME_HEIGHT;
          break;
        case 2: // Bottom
          x = Math.random() * GAME_WIDTH;
          y = GAME_HEIGHT + size;
          break;
        case 3: // Left
          x = -size;
          y = Math.random() * GAME_HEIGHT;
          break;
      }
      
      newAsteroids.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        vertices: generateAsteroidVertices(size)
      });
    }
    
    setAsteroids(newAsteroids);
  };

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawParticles} />
      <pixiGraphics draw={drawAsteroids} />
      <pixiGraphics draw={drawBullets} />
      <pixiGraphics draw={drawPlayer} />
      <pixiGraphics draw={drawUI} />
    </>
  );
};

const AsteroidsGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    rotation: 0,
    vx: 0,
    vy: 0
  });
  const [bullets, setBullets] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [particles, setParticles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [keys, setKeys] = useState({ 
    left: false, 
    right: false, 
    up: false, 
    space: false 
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== 'playing') return;
      
      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'Space':
          event.preventDefault();
          if (!keys.space) {
            shoot();
            setKeys(prev => ({ ...prev, space: true }));
          }
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'Space':
          event.preventDefault();
          setKeys(prev => ({ ...prev, space: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, keys.space]);

  // Player movement and rotation
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setPlayer(prevPlayer => {
          let newRotation = prevPlayer.rotation;
          let newVx = prevPlayer.vx;
          let newVy = prevPlayer.vy;
          
          // Rotation
          if (keys.left) {
            newRotation -= PLAYER_ROTATION_SPEED;
          }
          if (keys.right) {
            newRotation += PLAYER_ROTATION_SPEED;
          }
          
          // Thrust
          if (keys.up) {
            newVx += Math.cos(newRotation) * 0.2;
            newVy += Math.sin(newRotation) * 0.2;
          }
          
          // Apply friction
          newVx *= 0.98;
          newVy *= 0.98;
          
          // Update position
          let newX = prevPlayer.x + newVx;
          let newY = prevPlayer.y + newVy;
          
          // Wrap around screen
          newX = newX < 0 ? GAME_WIDTH : newX > GAME_WIDTH ? 0 : newX;
          newY = newY < 0 ? GAME_HEIGHT : newY > GAME_HEIGHT ? 0 : newY;
          
          return {
            ...prevPlayer,
            x: newX,
            y: newY,
            rotation: newRotation,
            vx: newVx,
            vy: newVy
          };
        });
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [gameState, keys]);

  const shoot = () => {
    if (bullets.length < 5) { // Limit bullets
      const bulletVx = Math.cos(player.rotation) * BULLET_SPEED;
      const bulletVy = Math.sin(player.rotation) * BULLET_SPEED;
      
      setBullets(prev => [...prev, {
        x: player.x + Math.cos(player.rotation) * PLAYER_SIZE,
        y: player.y + Math.sin(player.rotation) * PLAYER_SIZE,
        vx: bulletVx,
        vy: bulletVy,
        life: 60
      }]);
    }
  };

  const startGame = () => {
    setPlayer({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      rotation: 0,
      vx: 0,
      vy: 0
    });
    setBullets([]);
    setAsteroids([]);
    setParticles([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('playing');
    
    // Spawn initial asteroids
    const initialAsteroids = [];
    for (let i = 0; i < 4; i++) {
      const size = Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * ASTEROID_SPEED + 0.5;
      
      initialAsteroids.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        vertices: generateAsteroidVertices(size)
      });
    }
    setAsteroids(initialAsteroids);
  };

  const generateAsteroidVertices = (size) => {
    const vertices = [];
    const vertexCount = Math.floor(Math.random() * 4) + 6;
    
    for (let i = 0; i < vertexCount; i++) {
      const angle = (Math.PI * 2 * i) / vertexCount;
      const radius = size + Math.random() * size * 0.3;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    
    return vertices;
  };

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000011 });
    graphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fill();
    
    // Stars
    graphics.setFillStyle({ color: 0xffffff });
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % GAME_WIDTH;
      const y = (i * 23) % GAME_HEIGHT;
      graphics.rect(x, y, 1, 1);
    }
    graphics.fill();
  }, []);

  const drawPlayer = useCallback((graphics) => {
    graphics.clear();
    
    const cos = Math.cos(player.rotation);
    const sin = Math.sin(player.rotation);
    
    // Ship triangle
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.moveTo(player.x + cos * PLAYER_SIZE, player.y + sin * PLAYER_SIZE);
    graphics.lineTo(player.x - cos * PLAYER_SIZE/2 - sin * PLAYER_SIZE/2, 
                   player.y - sin * PLAYER_SIZE/2 + cos * PLAYER_SIZE/2);
    graphics.lineTo(player.x - cos * PLAYER_SIZE/2 + sin * PLAYER_SIZE/2, 
                   player.y - sin * PLAYER_SIZE/2 - cos * PLAYER_SIZE/2);
    graphics.lineTo(player.x + cos * PLAYER_SIZE, player.y + sin * PLAYER_SIZE);
    graphics.stroke();
  }, [player]);

  const drawBullets = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xffff00 });
    bullets.forEach(bullet => {
      graphics.rect(bullet.x - 1, bullet.y - 1, 2, 2);
    });
    graphics.fill();
  }, [bullets]);

  const drawAsteroids = useCallback((graphics) => {
    graphics.clear();
    graphics.setStrokeStyle({ color: 0x888888, width: 2 });
    
    asteroids.forEach(asteroid => {
      graphics.moveTo(
        asteroid.x + asteroid.vertices[0].x * Math.cos(asteroid.rotation) - asteroid.vertices[0].y * Math.sin(asteroid.rotation),
        asteroid.y + asteroid.vertices[0].x * Math.sin(asteroid.rotation) + asteroid.vertices[0].y * Math.cos(asteroid.rotation)
      );
      
      for (let i = 1; i < asteroid.vertices.length; i++) {
        const vertex = asteroid.vertices[i];
        graphics.lineTo(
          asteroid.x + vertex.x * Math.cos(asteroid.rotation) - vertex.y * Math.sin(asteroid.rotation),
          asteroid.y + vertex.x * Math.sin(asteroid.rotation) + vertex.y * Math.cos(asteroid.rotation)
        );
      }
      
      graphics.lineTo(
        asteroid.x + asteroid.vertices[0].x * Math.cos(asteroid.rotation) - asteroid.vertices[0].y * Math.sin(asteroid.rotation),
        asteroid.y + asteroid.vertices[0].x * Math.sin(asteroid.rotation) + asteroid.vertices[0].y * Math.cos(asteroid.rotation)
      );
    });
    graphics.stroke();
  }, [asteroids]);

  const drawParticles = useCallback((graphics) => {
    graphics.clear();
    particles.forEach(particle => {
      graphics.setFillStyle({ color: 0xff6b6b, alpha: particle.alpha });
      graphics.rect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
      graphics.fill();
    });
  }, [particles]);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    // UI background
    graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
    graphics.rect(0, 0, GAME_WIDTH, 40);
    graphics.fill();
  }, []);

  const titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    fill: 0xffffff,
    align: "center"
  });

  const uiTextStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffffff,
    align: "left"
  });

  return (
    <>
      <h1>Asteroids Game</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={startGame}
          disabled={gameState === 'playing'}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: gameState === 'playing' ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: gameState === 'playing' ? 'not-allowed' : 'pointer'
          }}
        >
          {gameState === 'menu' ? 'Start Game' : gameState === 'gameOver' ? 'Play Again' : 'Playing...'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Application 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT}
          eventMode="static"
          style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
        >
          <AsteroidsGameChild 
            gameState={gameState}
            player={player}
            bullets={bullets}
            asteroids={asteroids}
            particles={particles}
            score={score}
            lives={lives}
            level={level}
            setGameState={setGameState}
            setPlayer={setPlayer}
            setBullets={setBullets}
            setAsteroids={setAsteroids}
            setParticles={setParticles}
            setScore={setScore}
            setLives={setLives}
            setLevel={setLevel}
            drawBackground={drawBackground}
            drawPlayer={drawPlayer}
            drawBullets={drawBullets}
            drawAsteroids={drawAsteroids}
            drawParticles={drawParticles}
            drawUI={drawUI}
          />
          
          <pixiText
            text={`Score: ${score}`}
            style={uiTextStyle}
            x={10}
            y={10}
          />
          
          <pixiText
            text={`Lives: ${lives}`}
            style={uiTextStyle}
            x={GAME_WIDTH - 80}
            y={10}
          />
          
          <pixiText
            text={`Level: ${level}`}
            style={uiTextStyle}
            x={GAME_WIDTH / 2 - 30}
            y={10}
          />
          
          {gameState === 'gameOver' && (
            <pixiText
              text="GAME OVER"
              style={titleStyle}
              x={GAME_WIDTH / 2}
              y={GAME_HEIGHT / 2}
              anchor={0.5}
            />
          )}
        </Application>

        <div style={{ 
          width: '200px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Controls</h3>
          <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.5' }}>
            <p><strong>← →</strong> Rotate ship</p>
            <p><strong>↑</strong> Thrust</p>
            <p><strong>Space</strong> Shoot</p>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Objective:</strong></p>
            <p>Destroy all asteroids and survive as long as possible!</p>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Gameplay:</strong></p>
            <p>• Shoot asteroids to break them apart</p>
            <p>• Avoid collisions with asteroids</p>
            <p>• Screen wraps around edges</p>
            <p>• Higher levels = more asteroids</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Game Status:</strong> {
          gameState === 'menu' && 'Ready to start!' ||
          gameState === 'playing' && 'Playing - Use arrow keys and space to control!' ||
          gameState === 'gameOver' && 'Game Over - Press Play Again!'
        }</p>
      </div>
    </>
  );
};

export default AsteroidsGame;
