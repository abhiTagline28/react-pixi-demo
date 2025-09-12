import { Container, Graphics, Sprite, Texture, Assets } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
});

const SnakeGameChild = ({ 
  gameState,
  snake,
  food,
  direction,
  nextDirection,
  score,
  gameOver,
  setGameState,
  setSnake,
  setFood,
  setDirection,
  setScore,
  setGameOver,
  drawSnake,
  drawFood,
  drawBackground,
  drawGameOver
}) => {
  const [frameCount, setFrameCount] = useState(0);
  
  useTick(() => {
    if (gameState === 'playing') {
      setFrameCount(prev => prev + 1);
      
      // Slow down the game - move every 10 frames
      if (frameCount % 10 !== 0) return;
      
      // Update direction at the start of each move
      setDirection(nextDirection);
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        // Move head based on current direction
        switch (nextDirection) {
          case 'up':
            head.y -= 20;
            break;
          case 'down':
            head.y += 20;
            break;
          case 'left':
            head.x -= 20;
            break;
          case 'right':
            head.x += 20;
            break;
        }
        
        // Check wall collision
        if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 400) {
          setGameOver(true);
          setGameState('gameOver');
          return prevSnake;
        }
        
        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setGameState('gameOver');
          return prevSnake;
        }
        
        newSnake.unshift(head);
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          // Generate new food position that doesn't overlap with snake
          let newFood;
          do {
            newFood = {
              x: Math.floor(Math.random() * 30) * 20,
              y: Math.floor(Math.random() * 20) * 20,
            };
          } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
          setFood(newFood);
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawSnake} />
      <pixiGraphics draw={drawFood} />
      {gameOver && <pixiGraphics draw={drawGameOver} />}
    </>
  );
};

const SnakeGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [snake, setSnake] = useState([{ x: 300, y: 200 }]);
  const [food, setFood] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState('right');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextDirection, setNextDirection] = useState('right');

  useEffect(() => {
    // Initialize food position
    setFood({
      x: Math.floor(Math.random() * 30) * 20,
      y: Math.floor(Math.random() * 20) * 20,
    });
  }, []);

  // Global keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== 'playing') return;
      
      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          if (direction !== 'down') setNextDirection('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (direction !== 'up') setNextDirection('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (direction !== 'right') setNextDirection('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (direction !== 'left') setNextDirection('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, direction]);

  const startGame = useCallback(() => {
    setSnake([{ x: 300, y: 200 }]);
    setDirection('right');
    setNextDirection('right');
    setScore(0);
    setGameOver(false);
    setGameState('playing');
    setFood({
      x: Math.floor(Math.random() * 30) * 20,
      y: Math.floor(Math.random() * 20) * 20,
    });
  }, []);


  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
    
    // Draw grid
    graphics.setStrokeStyle({ color: 0x2a2a4e, width: 1 });
    for (let x = 0; x <= 600; x += 20) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 400);
    }
    for (let y = 0; y <= 400; y += 20) {
      graphics.moveTo(0, y);
      graphics.lineTo(600, y);
    }
    graphics.stroke();
  }, []);

  const drawSnake = useCallback((graphics) => {
    graphics.clear();
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        graphics.setFillStyle({ color: 0x00ff00 });
      } else {
        // Body
        graphics.setFillStyle({ color: 0x008800 });
      }
      graphics.rect(segment.x, segment.y, 18, 18);
      graphics.fill();
    });
  }, [snake]);

  const drawFood = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xff0000 });
    graphics.circle(food.x + 10, food.y + 10, 8);
    graphics.fill();
  }, [food]);

  const drawGameOver = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(200, 150, 200, 100);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x000000, width: 2 });
    graphics.rect(200, 150, 200, 100);
    graphics.stroke();
  }, []);

  return (
    <>
      <h1>Snake Game</h1>
      <div style={{ marginBottom: '10px' }}>
        <span>Score: {score}</span>
        <span style={{ marginLeft: '20px' }}>
          {gameState === 'menu' && 'Press Start to begin!'}
          {gameState === 'playing' && 'Use arrow keys to control the snake!'}
          {gameState === 'gameOver' && 'Game Over! Press Start to play again.'}
        </span>
        <button 
          onClick={startGame} 
          style={{ marginLeft: '20px', padding: '5px 10px' }}
        >
          {gameState === 'menu' ? 'Start Game' : 'Restart'}
        </button>
      </div>
      <Application 
        width={600} 
        height={400}
        eventMode="static"
        style={{ outline: 'none', cursor: 'crosshair' }}
      >
        <SnakeGameChild 
          gameState={gameState}
          snake={snake}
          food={food}
          direction={direction}
          nextDirection={nextDirection}
          score={score}
          gameOver={gameOver}
          setGameState={setGameState}
          setSnake={setSnake}
          setFood={setFood}
          setDirection={setDirection}
          setScore={setScore}
          setGameOver={setGameOver}
          drawSnake={drawSnake}
          drawFood={drawFood}
          drawBackground={drawBackground}
          drawGameOver={drawGameOver}
        />
      </Application>
    </>
  );
};

export default SnakeGame;
