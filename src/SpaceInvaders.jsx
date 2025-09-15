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
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const INVADER_SPEED = 1;
const INVADER_ROWS = 5;
const INVADER_COLS = 10;

const SpaceInvadersChild = ({
  gameState,
  player,
  bullets,
  invaders,
  invaderBullets,
  score,
  lives,
  level,
  setGameState,
  setPlayer,
  setBullets,
  setInvaders,
  setInvaderBullets,
  setScore,
  setLives,
  setLevel,
  drawBackground,
  drawPlayer,
  drawBullets,
  drawInvaders,
  drawInvaderBullets,
  drawUI
}) => {
  const [frameCount, setFrameCount] = useState(0);
  const [invaderDirection, setInvaderDirection] = useState(1);

  useTick(() => {
    if (gameState === 'playing') {
      setFrameCount(prev => prev + 1);
      
      // Move invaders
      if (frameCount % 30 === 0) {
        setInvaders(prevInvaders => {
          const newInvaders = prevInvaders.map(row => 
            row.map(invader => ({
              ...invader,
              x: invader.x + invaderDirection * INVADER_SPEED
            }))
          );
          
          // Check if invaders hit walls
          const leftmostX = Math.min(...newInvaders.flat().map(inv => inv.x));
          const rightmostX = Math.max(...newInvaders.flat().map(inv => inv.x + inv.width));
          
          if (leftmostX <= 0 || rightmostX >= GAME_WIDTH) {
            setInvaderDirection(prev => -prev);
            return prevInvaders.map(row => 
              row.map(invader => ({
                ...invader,
                y: invader.y + 20
              }))
            );
          }
          
          return newInvaders;
        });
      }
      
      // Move bullets
      if (frameCount % 2 === 0) {
        setBullets(prevBullets => 
          prevBullets.filter(bullet => bullet.y > -10).map(bullet => ({
            ...bullet,
            y: bullet.y - BULLET_SPEED
          }))
        );
        
        setInvaderBullets(prevBullets => 
          prevBullets.filter(bullet => bullet.y < GAME_HEIGHT + 10).map(bullet => ({
            ...bullet,
            y: bullet.y + BULLET_SPEED
          }))
        );
      }
      
      // Invader shooting
      if (frameCount % 60 === 0 && invaders.length > 0) {
        const activeInvaders = invaders.flat().filter(inv => inv.alive);
        if (activeInvaders.length > 0) {
          const randomInvader = activeInvaders[Math.floor(Math.random() * activeInvaders.length)];
          setInvaderBullets(prev => [...prev, {
            x: randomInvader.x + randomInvader.width / 2,
            y: randomInvader.y + randomInvader.height,
            width: 4,
            height: 8
          }]);
        }
      }
      
      // Check collisions
      checkCollisions();
      
      // Check win/lose conditions
      const aliveInvaders = invaders.flat().filter(inv => inv.alive);
      if (aliveInvaders.length === 0) {
        setLevel(prev => prev + 1);
        spawnInvaders();
      }
      
      if (lives <= 0) {
        setGameState('gameOver');
      }
    }
  });

  const checkCollisions = () => {
    // Bullet vs Invader collisions
    setBullets(prevBullets => {
      const newBullets = [...prevBullets];
      const bulletsToRemove = [];
      
      prevBullets.forEach((bullet, bulletIndex) => {
        invaders.forEach((row, rowIndex) => {
          row.forEach((invader, invaderIndex) => {
            if (invader.alive && 
                bullet.x < invader.x + invader.width &&
                bullet.x + bullet.width > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + bullet.height > invader.y) {
              
              bulletsToRemove.push(bulletIndex);
              setInvaders(prev => {
                const newInvaders = [...prev];
                newInvaders[rowIndex][invaderIndex].alive = false;
                return newInvaders;
              });
              setScore(prev => prev + 10);
            }
          });
        });
      });
      
      return newBullets.filter((_, index) => !bulletsToRemove.includes(index));
    });
    
    // Invader bullet vs Player collisions
    setInvaderBullets(prevBullets => {
      const newBullets = [...prevBullets];
      const bulletsToRemove = [];
      
      prevBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
          
          bulletsToRemove.push(bulletIndex);
          setLives(prev => prev - 1);
        }
      });
      
      return newBullets.filter((_, index) => !bulletsToRemove.includes(index));
    });
  };

  const spawnInvaders = () => {
    const newInvaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
      const invaderRow = [];
      for (let col = 0; col < INVADER_COLS; col++) {
        invaderRow.push({
          x: 50 + col * 50,
          y: 50 + row * 30,
          width: 30,
          height: 20,
          alive: true,
          color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][row]
        });
      }
      newInvaders.push(invaderRow);
    }
    setInvaders(newInvaders);
  };

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawInvaders} />
      <pixiGraphics draw={drawBullets} />
      <pixiGraphics draw={drawInvaderBullets} />
      <pixiGraphics draw={drawPlayer} />
      <pixiGraphics draw={drawUI} />
    </>
  );
};

const SpaceInvaders = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2 - 25, y: GAME_HEIGHT - 50, width: 50, height: 20 });
  const [bullets, setBullets] = useState([]);
  const [invaders, setInvaders] = useState([]);
  const [invaderBullets, setInvaderBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [keys, setKeys] = useState({ left: false, right: false });

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
        case 'Space':
          event.preventDefault();
          shoot();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Player movement
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setPlayer(prevPlayer => {
          let newX = prevPlayer.x;
          
          if (keys.left && newX > 0) {
            newX -= PLAYER_SPEED;
          }
          if (keys.right && newX < GAME_WIDTH - prevPlayer.width) {
            newX += PLAYER_SPEED;
          }
          
          return { ...prevPlayer, x: newX };
        });
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [gameState, keys]);

  const shoot = () => {
    if (bullets.length < 5) { // Limit bullets
      setBullets(prev => [...prev, {
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 8
      }]);
    }
  };

  const startGame = () => {
    setPlayer({ x: GAME_WIDTH / 2 - 25, y: GAME_HEIGHT - 50, width: 50, height: 20 });
    setBullets([]);
    setInvaderBullets([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('playing');
    
    // Spawn invaders
    const newInvaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
      const invaderRow = [];
      for (let col = 0; col < INVADER_COLS; col++) {
        invaderRow.push({
          x: 50 + col * 50,
          y: 50 + row * 30,
          width: 30,
          height: 20,
          alive: true,
          color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][row]
        });
      }
      newInvaders.push(invaderRow);
    }
    setInvaders(newInvaders);
  };

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000033 });
    graphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fill();
    
    // Stars
    graphics.setFillStyle({ color: 0xffffff });
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % GAME_WIDTH;
      const y = (i * 23) % GAME_HEIGHT;
      graphics.rect(x, y, 1, 1);
    }
    graphics.fill();
  }, []);

  const drawPlayer = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x00ff00 });
    graphics.rect(player.x, player.y, player.width, player.height);
    graphics.fill();
    
    // Player details
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(player.x + 10, player.y - 5, 30, 5);
    graphics.fill();
  }, [player]);

  const drawBullets = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xffff00 });
    bullets.forEach(bullet => {
      graphics.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    graphics.fill();
  }, [bullets]);

  const drawInvaders = useCallback((graphics) => {
    graphics.clear();
    invaders.forEach(row => {
      row.forEach(invader => {
        if (invader.alive) {
          graphics.setFillStyle({ color: invader.color });
          graphics.rect(invader.x, invader.y, invader.width, invader.height);
          graphics.fill();
          
          // Invader details
          graphics.setFillStyle({ color: 0xffffff });
          graphics.rect(invader.x + 5, invader.y + 5, 5, 5);
          graphics.rect(invader.x + 20, invader.y + 5, 5, 5);
          graphics.fill();
        }
      });
    });
  }, [invaders]);

  const drawInvaderBullets = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xff0000 });
    invaderBullets.forEach(bullet => {
      graphics.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    graphics.fill();
  }, [invaderBullets]);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    // UI background
    graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
    graphics.rect(0, 0, GAME_WIDTH, 30);
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
      <h1>Space Invaders</h1>
      
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
          <SpaceInvadersChild 
            gameState={gameState}
            player={player}
            bullets={bullets}
            invaders={invaders}
            invaderBullets={invaderBullets}
            score={score}
            lives={lives}
            level={level}
            setGameState={setGameState}
            setPlayer={setPlayer}
            setBullets={setBullets}
            setInvaders={setInvaders}
            setInvaderBullets={setInvaderBullets}
            setScore={setScore}
            setLives={setLives}
            setLevel={setLevel}
            drawBackground={drawBackground}
            drawPlayer={drawPlayer}
            drawBullets={drawBullets}
            drawInvaders={drawInvaders}
            drawInvaderBullets={drawInvaderBullets}
            drawUI={drawUI}
          />
          
          <pixiText
            text={`Score: ${score}`}
            style={uiTextStyle}
            x={10}
            y={5}
          />
          
          <pixiText
            text={`Lives: ${lives}`}
            style={uiTextStyle}
            x={GAME_WIDTH - 80}
            y={5}
          />
          
          <pixiText
            text={`Level: ${level}`}
            style={uiTextStyle}
            x={GAME_WIDTH / 2 - 30}
            y={5}
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
            <p><strong>← →</strong> Move spaceship</p>
            <p><strong>Space</strong> Shoot</p>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Objective:</strong></p>
            <p>Destroy all invaders before they reach you or destroy your ship!</p>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Scoring:</strong></p>
            <p>• Each invader: 10 points</p>
            <p>• Complete level: Bonus points</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Game Status:</strong> {
          gameState === 'menu' && 'Ready to start!' ||
          gameState === 'playing' && 'Playing - Use arrow keys to move, space to shoot!' ||
          gameState === 'gameOver' && 'Game Over - Press Play Again!'
        }</p>
      </div>
    </>
  );
};

export default SpaceInvaders;
