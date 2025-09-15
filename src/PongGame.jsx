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
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;
const BALL_SPEED = 4;

const PongGameChild = ({
  gameState,
  player1,
  player2,
  ball,
  score1,
  score2,
  servingPlayer,
  setGameState,
  setPlayer1,
  setPlayer2,
  setBall,
  setScore1,
  setScore2,
  setServingPlayer,
  drawBackground,
  drawPaddles,
  drawBall,
  drawCenterLine,
  drawUI
}) => {
  const [frameCount, setFrameCount] = useState(0);

  useTick(() => {
    if (gameState === 'playing') {
      setFrameCount(prev => prev + 1);
      
      // Move ball
      if (frameCount % 2 === 0) {
        setBall(prevBall => {
          let newBall = {
            ...prevBall,
            x: prevBall.x + prevBall.vx,
            y: prevBall.y + prevBall.vy
          };
          
          // Ball collision with top/bottom walls
          if (newBall.y <= 0 || newBall.y >= GAME_HEIGHT - BALL_SIZE) {
            newBall.vy = -newBall.vy;
            newBall.y = Math.max(0, Math.min(GAME_HEIGHT - BALL_SIZE, newBall.y));
          }
          
          // Ball collision with paddles
          // Player 1 paddle
          if (newBall.x <= player1.x + PADDLE_WIDTH &&
              newBall.x + BALL_SIZE >= player1.x &&
              newBall.y + BALL_SIZE >= player1.y &&
              newBall.y <= player1.y + PADDLE_HEIGHT &&
              newBall.vx < 0) {
            
            const hitPos = (newBall.y - player1.y) / PADDLE_HEIGHT;
            const angle = (hitPos - 0.5) * Math.PI / 3; // -60 to +60 degrees
            const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);
            
            newBall.vx = Math.cos(angle) * speed;
            newBall.vy = Math.sin(angle) * speed;
            newBall.x = player1.x + PADDLE_WIDTH;
          }
          
          // Player 2 paddle
          if (newBall.x + BALL_SIZE >= player2.x &&
              newBall.x <= player2.x + PADDLE_WIDTH &&
              newBall.y + BALL_SIZE >= player2.y &&
              newBall.y <= player2.y + PADDLE_HEIGHT &&
              newBall.vx > 0) {
            
            const hitPos = (newBall.y - player2.y) / PADDLE_HEIGHT;
            const angle = Math.PI - (hitPos - 0.5) * Math.PI / 3; // 120 to 240 degrees
            const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);
            
            newBall.vx = Math.cos(angle) * speed;
            newBall.vy = Math.sin(angle) * speed;
            newBall.x = player2.x - BALL_SIZE;
          }
          
          // Score points
          if (newBall.x < 0) {
            setScore2(prev => prev + 1);
            resetBall(2);
            return newBall;
          } else if (newBall.x > GAME_WIDTH) {
            setScore1(prev => prev + 1);
            resetBall(1);
            return newBall;
          }
          
          return newBall;
        });
      }
      
      // AI for player 2 (simple)
      if (frameCount % 3 === 0) {
        setPlayer2(prevPlayer2 => {
          const ballCenter = ball.y + BALL_SIZE / 2;
          const paddleCenter = prevPlayer2.y + PADDLE_HEIGHT / 2;
          
          if (ballCenter < paddleCenter - 10) {
            return { ...prevPlayer2, y: Math.max(0, prevPlayer2.y - PADDLE_SPEED) };
          } else if (ballCenter > paddleCenter + 10) {
            return { ...prevPlayer2, y: Math.min(GAME_HEIGHT - PADDLE_HEIGHT, prevPlayer2.y + PADDLE_SPEED) };
          }
          
          return prevPlayer2;
        });
      }
    }
  });

  const resetBall = (servingPlayer) => {
    const angle = servingPlayer === 1 ? 0 : Math.PI;
    const speed = BALL_SPEED;
    
    setBall({
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
    
    setServingPlayer(servingPlayer);
  };

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawCenterLine} />
      <pixiGraphics draw={drawPaddles} />
      <pixiGraphics draw={drawBall} />
      <pixiGraphics draw={drawUI} />
    </>
  );
};

const PongGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [player1, setPlayer1] = useState({ x: 20, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [player2, setPlayer2] = useState({ x: GAME_WIDTH - 20 - PADDLE_WIDTH, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [ball, setBall] = useState({
    x: GAME_WIDTH / 2 - BALL_SIZE / 2,
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    vx: BALL_SPEED,
    vy: 0
  });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [servingPlayer, setServingPlayer] = useState(1);
  const [keys, setKeys] = useState({ up: false, down: false });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== 'playing') return;
      
      switch (event.code) {
        case 'KeyW':
          event.preventDefault();
          setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'KeyS':
          event.preventDefault();
          setKeys(prev => ({ ...prev, down: true }));
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          event.preventDefault();
          setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'KeyS':
          event.preventDefault();
          setKeys(prev => ({ ...prev, down: false }));
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

  // Player 1 movement
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setPlayer1(prevPlayer1 => {
          let newY = prevPlayer1.y;
          
          if (keys.up && newY > 0) {
            newY -= PADDLE_SPEED;
          }
          if (keys.down && newY < GAME_HEIGHT - PADDLE_HEIGHT) {
            newY += PADDLE_SPEED;
          }
          
          return { ...prevPlayer1, y: newY };
        });
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [gameState, keys]);

  const startGame = () => {
    setPlayer1({ x: 20, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    setPlayer2({ x: GAME_WIDTH - 20 - PADDLE_WIDTH, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    setBall({
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      vx: BALL_SPEED,
      vy: 0
    });
    setScore1(0);
    setScore2(0);
    setServingPlayer(1);
    setGameState('playing');
  };

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fill();
  }, []);

  const drawCenterLine = useCallback((graphics) => {
    graphics.clear();
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    
    for (let y = 0; y < GAME_HEIGHT; y += 20) {
      graphics.moveTo(GAME_WIDTH / 2, y);
      graphics.lineTo(GAME_WIDTH / 2, y + 10);
    }
    graphics.stroke();
  }, []);

  const drawPaddles = useCallback((graphics) => {
    graphics.clear();
    
    // Player 1 paddle
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    graphics.fill();
    
    // Player 2 paddle
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    graphics.fill();
  }, [player1, player2]);

  const drawBall = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    graphics.fill();
  }, [ball]);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    // Score background
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

  const scoreStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontWeight: "bold",
    fill: 0xffffff,
    align: "center"
  });

  const uiTextStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffffff,
    align: "center"
  });

  return (
    <>
      <h1>Pong Game</h1>
      
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
          <PongGameChild 
            gameState={gameState}
            player1={player1}
            player2={player2}
            ball={ball}
            score1={score1}
            score2={score2}
            servingPlayer={servingPlayer}
            setGameState={setGameState}
            setPlayer1={setPlayer1}
            setPlayer2={setPlayer2}
            setBall={setBall}
            setScore1={setScore1}
            setScore2={setScore2}
            setServingPlayer={setServingPlayer}
            drawBackground={drawBackground}
            drawPaddles={drawPaddles}
            drawBall={drawBall}
            drawCenterLine={drawCenterLine}
            drawUI={drawUI}
          />
          
          <pixiText
            text={score1.toString()}
            style={scoreStyle}
            x={GAME_WIDTH / 4}
            y={5}
            anchor={0.5}
          />
          
          <pixiText
            text={score2.toString()}
            style={scoreStyle}
            x={3 * GAME_WIDTH / 4}
            y={5}
            anchor={0.5}
          />
          
          <pixiText
            text="Player 1"
            style={uiTextStyle}
            x={GAME_WIDTH / 4}
            y={GAME_HEIGHT - 20}
            anchor={0.5}
          />
          
          <pixiText
            text="AI Player"
            style={uiTextStyle}
            x={3 * GAME_WIDTH / 4}
            y={GAME_HEIGHT - 20}
            anchor={0.5}
          />
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
            <p><strong>W</strong> Move paddle up</p>
            <p><strong>S</strong> Move paddle down</p>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Objective:</strong></p>
            <p>Keep the ball in play and score points by getting it past your opponent's paddle!</p>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Gameplay:</strong></p>
            <p>• Ball bounces off paddles at different angles</p>
            <p>• First to score wins the point</p>
            <p>• AI opponent provides challenge</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Game Status:</strong> {
          gameState === 'menu' && 'Ready to start!' ||
          gameState === 'playing' && 'Playing - Use W/S keys to control your paddle!' ||
          gameState === 'gameOver' && 'Game Over - Press Play Again!'
        }</p>
      </div>
    </>
  );
};

export default PongGame;
