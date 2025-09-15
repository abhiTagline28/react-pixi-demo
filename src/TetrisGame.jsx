import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Text,
});

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

// Tetris pieces (tetrominoes)
const PIECES = [
  {
    shape: [
      [1, 1, 1, 1]
    ],
    color: 0x00ffff // Cyan
  },
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 0xffff00 // Yellow
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: 0x800080 // Purple
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: 0x00ff00 // Green
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: 0xff0000 // Red
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: 0xff8000 // Orange
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: 0x0000ff // Blue
  }
];

const TetrisGameChild = ({
  gameState,
  board,
  currentPiece,
  currentPosition,
  score,
  lines,
  level,
  nextPiece,
  setGameState,
  setBoard,
  setCurrentPiece,
  setCurrentPosition,
  setScore,
  setLines,
  setLevel,
  setNextPiece,
  drawBoard,
  drawPiece,
  drawNextPiece,
  drawUI
}) => {
  const [frameCount, setFrameCount] = useState(0);

  useTick(() => {
    if (gameState === 'playing') {
      setFrameCount(prev => prev + 1);
      
      // Game speed based on level
      const dropInterval = Math.max(1, 20 - level);
      
      if (frameCount % dropInterval === 0) {
        // Move piece down
        const newPosition = { ...currentPosition, y: currentPosition.y + 1 };
        
        if (isValidPosition(board, currentPiece, newPosition)) {
          setCurrentPosition(newPosition);
        } else {
          // Place piece on board
          placePiece();
        }
      }
    }
  });

  const isValidPosition = (board, piece, position) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = () => {
    const newBoard = board.map(row => [...row]);
    
    // Place current piece
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardX = currentPosition.x + x;
          const boardY = currentPosition.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    
    setBoard(newBoard);
    
    // Check for completed lines
    const completedLines = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (newBoard[y].every(cell => cell !== 0)) {
        completedLines.push(y);
      }
    }
    
    if (completedLines.length > 0) {
      // Remove completed lines
      const newBoardWithoutLines = newBoard.filter((_, index) => !completedLines.includes(index));
      const emptyLines = Array(completedLines.length).fill(Array(BOARD_WIDTH).fill(0));
      const finalBoard = [...emptyLines, ...newBoardWithoutLines];
      
      setBoard(finalBoard);
      setLines(prev => prev + completedLines.length);
      setScore(prev => prev + completedLines.length * 100 * (level + 1));
      setLevel(Math.floor((lines + completedLines.length) / 10));
    }
    
    // Spawn new piece
    spawnNewPiece();
    
    // Check game over
    if (!isValidPosition(newBoard, nextPiece, { x: 3, y: 0 })) {
      setGameState('gameOver');
    }
  };

  const spawnNewPiece = () => {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
    setCurrentPiece(randomPiece);
    setCurrentPosition({ x: 3, y: 0 });
    setNextPiece(PIECES[Math.floor(Math.random() * PIECES.length)]);
  };

  return (
    <>
      <pixiGraphics draw={drawBoard} />
      <pixiGraphics draw={drawPiece} />
      <pixiGraphics draw={drawNextPiece} />
      <pixiGraphics draw={drawUI} />
    </>
  );
};

const TetrisGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState(PIECES[0]);
  const [currentPosition, setCurrentPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [nextPiece, setNextPiece] = useState(PIECES[1]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== 'playing') return;
      
      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          const leftPos = { ...currentPosition, x: currentPosition.x - 1 };
          if (isValidPosition(board, currentPiece, leftPos)) {
            setCurrentPosition(leftPos);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          const rightPos = { ...currentPosition, x: currentPosition.x + 1 };
          if (isValidPosition(board, currentPiece, rightPos)) {
            setCurrentPosition(rightPos);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          const downPos = { ...currentPosition, y: currentPosition.y + 1 };
          if (isValidPosition(board, currentPiece, downPos)) {
            setCurrentPosition(downPos);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotatePiece();
          break;
        case 'Space':
          event.preventDefault();
          hardDrop();
          break;
        case 'KeyP':
          event.preventDefault();
          setGameState(gameState === 'playing' ? 'paused' : 'playing');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentPosition, currentPiece, board]);

  const isValidPosition = (board, piece, position) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const rotatePiece = () => {
    const rotated = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
      )
    };
    
    if (isValidPosition(board, rotated, currentPosition)) {
      setCurrentPiece(rotated);
    }
  };

  const hardDrop = () => {
    let newY = currentPosition.y;
    while (isValidPosition(board, currentPiece, { ...currentPosition, y: newY + 1 })) {
      newY++;
    }
    setCurrentPosition({ ...currentPosition, y: newY });
  };

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(PIECES[Math.floor(Math.random() * PIECES.length)]);
    setCurrentPosition({ x: 3, y: 0 });
    setNextPiece(PIECES[Math.floor(Math.random() * PIECES.length)]);
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameState('playing');
  };

  const drawBoard = useCallback((graphics) => {
    graphics.clear();
    
    // Board background
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    graphics.fill();
    
    // Board border
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.rect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    graphics.stroke();
    
    // Grid lines
    graphics.setStrokeStyle({ color: 0x333333, width: 1 });
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      graphics.moveTo(x * CELL_SIZE, 0);
      graphics.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      graphics.moveTo(0, y * CELL_SIZE);
      graphics.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
    }
    graphics.stroke();
    
    // Placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          graphics.setFillStyle({ color: board[y][x] });
          graphics.rect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          graphics.fill();
        }
      }
    }
  }, [board]);

  const drawPiece = useCallback((graphics) => {
    graphics.clear();
    
    if (gameState !== 'playing') return;
    
    // Current falling piece
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const drawX = (currentPosition.x + x) * CELL_SIZE;
          const drawY = (currentPosition.y + y) * CELL_SIZE;
          
          graphics.setFillStyle({ color: currentPiece.color, alpha: 0.8 });
          graphics.rect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          graphics.fill();
          
          graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
          graphics.rect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          graphics.stroke();
        }
      }
    }
  }, [currentPiece, currentPosition, gameState]);

  const drawNextPiece = useCallback((graphics) => {
    graphics.clear();
    
    const nextX = BOARD_WIDTH * CELL_SIZE + 20;
    const nextY = 50;
    
    // Next piece background
    graphics.setFillStyle({ color: 0x222222 });
    graphics.rect(nextX, nextY, 120, 80);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
    graphics.rect(nextX, nextY, 120, 80);
    graphics.stroke();
    
    // Next piece
    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          const drawX = nextX + 10 + x * 15;
          const drawY = nextY + 10 + y * 15;
          
          graphics.setFillStyle({ color: nextPiece.color });
          graphics.rect(drawX, drawY, 14, 14);
          graphics.fill();
        }
      }
    }
  }, [nextPiece]);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    const uiX = BOARD_WIDTH * CELL_SIZE + 20;
    
    // Score background
    graphics.setFillStyle({ color: 0x222222 });
    graphics.rect(uiX, 150, 120, 100);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
    graphics.rect(uiX, 150, 120, 100);
    graphics.stroke();
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
      <h1>Tetris Game</h1>
      
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
        
        {gameState === 'playing' && (
          <button 
            onClick={() => setGameState('paused')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Pause
          </button>
        )}
        
        {gameState === 'paused' && (
          <button 
            onClick={() => setGameState('playing')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Resume
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Application 
          width={BOARD_WIDTH * CELL_SIZE + 160} 
          height={BOARD_HEIGHT * CELL_SIZE}
          eventMode="static"
          style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
        >
          <TetrisGameChild 
            gameState={gameState}
            board={board}
            currentPiece={currentPiece}
            currentPosition={currentPosition}
            score={score}
            lines={lines}
            level={level}
            nextPiece={nextPiece}
            setGameState={setGameState}
            setBoard={setBoard}
            setCurrentPiece={setCurrentPiece}
            setCurrentPosition={setCurrentPosition}
            setScore={setScore}
            setLines={setLines}
            setLevel={setLevel}
            setNextPiece={setNextPiece}
            drawBoard={drawBoard}
            drawPiece={drawPiece}
            drawNextPiece={drawNextPiece}
            drawUI={drawUI}
          />
          
          <pixiText
            text="NEXT"
            style={titleStyle}
            x={BOARD_WIDTH * CELL_SIZE + 80}
            y={20}
            anchor={0.5}
          />
          
          <pixiText
            text={`Score: ${score}`}
            style={uiTextStyle}
            x={BOARD_WIDTH * CELL_SIZE + 30}
            y={160}
          />
          
          <pixiText
            text={`Lines: ${lines}`}
            style={uiTextStyle}
            x={BOARD_WIDTH * CELL_SIZE + 30}
            y={180}
          />
          
          <pixiText
            text={`Level: ${level}`}
            style={uiTextStyle}
            x={BOARD_WIDTH * CELL_SIZE + 30}
            y={200}
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
            <p><strong>← →</strong> Move left/right</p>
            <p><strong>↓</strong> Soft drop</p>
            <p><strong>↑</strong> Rotate piece</p>
            <p><strong>Space</strong> Hard drop</p>
            <p><strong>P</strong> Pause/Resume</p>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Objective:</strong></p>
            <p>Fill horizontal lines to clear them and score points. Game speeds up as you level up!</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Game Status:</strong> {
          gameState === 'menu' && 'Ready to start!' ||
          gameState === 'playing' && 'Playing - Use arrow keys to control!' ||
          gameState === 'paused' && 'Paused - Press Resume to continue' ||
          gameState === 'gameOver' && 'Game Over - Press Play Again!'
        }</p>
      </div>
    </>
  );
};

export default TetrisGame;
