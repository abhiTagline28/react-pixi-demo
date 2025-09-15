import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Text,
});

const CARD_WIDTH = 60;
const CARD_HEIGHT = 80;
const GRID_COLS = 6;
const GRID_ROWS = 4;
const GAME_WIDTH = GRID_COLS * CARD_WIDTH + (GRID_COLS - 1) * 10 + 40;
const GAME_HEIGHT = GRID_ROWS * CARD_HEIGHT + (GRID_ROWS - 1) * 10 + 100;

const CARD_COLORS = [
  0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
  0xff8000, 0x8000ff, 0x80ff00, 0xff0080, 0x0080ff, 0x80ff80
];

const SYMBOLS = ['★', '●', '▲', '■', '♦', '♠', '♥', '♣', '◆', '◊', '○', '□'];

const MemoryGameChild = ({
  gameState,
  cards,
  flippedCards,
  matchedCards,
  moves,
  score,
  timeLeft,
  onCardClick,
  drawBackground,
  drawCards,
  drawUI
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useTick(() => {
    if (gameState === 'playing') {
      setAnimationProgress(prev => (prev + 0.02) % (Math.PI * 2));
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawCards} />
      <pixiGraphics draw={drawUI} />
    </>
  );
};

const MemoryGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [gameTimer, setGameTimer] = useState(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setGameTimer(timer);
      
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    // Check for matches when 2 cards are flipped
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      
      if (cards[card1].color === cards[card2].color) {
        // Match found
        setMatchedCards(prev => [...prev, card1, card2]);
        setScore(prev => prev + 10);
        
        // Check if all cards are matched
        setTimeout(() => {
          if (matchedCards.length + 2 === cards.length) {
            setGameState('gameOver');
          }
        }, 500);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards, matchedCards]);

  const initializeCards = () => {
    const totalCards = GRID_COLS * GRID_ROWS;
    const pairs = totalCards / 2;
    
    const cardData = [];
    
    // Create pairs
    for (let i = 0; i < pairs; i++) {
      const color = CARD_COLORS[i % CARD_COLORS.length];
      const symbol = SYMBOLS[i % SYMBOLS.length];
      
      cardData.push(
        { id: i * 2, color, symbol, matched: false },
        { id: i * 2 + 1, color, symbol, matched: false }
      );
    }
    
    // Shuffle cards
    const shuffledCards = cardData.sort(() => Math.random() - 0.5);
    
    // Position cards in grid
    const positionedCards = shuffledCards.map((card, index) => {
      const row = Math.floor(index / GRID_COLS);
      const col = index % GRID_COLS;
      
      return {
        ...card,
        x: 20 + col * (CARD_WIDTH + 10),
        y: 60 + row * (CARD_HEIGHT + 10)
      };
    });
    
    setCards(positionedCards);
  };

  const startGame = () => {
    initializeCards();
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(120);
    setGameState('playing');
  };

  const handleCardClick = (cardIndex) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardIndex)) return;
    if (matchedCards.includes(cardIndex)) return;
    
    setFlippedCards(prev => [...prev, cardIndex]);
  };

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x2c3e50 });
    graphics.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fill();
  }, []);

  const drawCards = useCallback((graphics) => {
    graphics.clear();
    
    cards.forEach((card, index) => {
      const isFlipped = flippedCards.includes(index);
      const isMatched = matchedCards.includes(index);
      
      // Card background
      if (isMatched) {
        graphics.setFillStyle({ color: 0x27ae60 });
      } else if (isFlipped) {
        graphics.setFillStyle({ color: card.color });
      } else {
        graphics.setFillStyle({ color: 0x34495e });
      }
      
      graphics.rect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
      graphics.fill();
      
      // Card border
      graphics.setStrokeStyle({ 
        color: isMatched ? 0x2ecc71 : isFlipped ? 0xffffff : 0x7f8c8d, 
        width: 2 
      });
      graphics.rect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
      graphics.stroke();
      
      // Card content
      if (isFlipped || isMatched) {
        // Symbol
        graphics.setFillStyle({ color: 0xffffff });
        graphics.rect(card.x + 15, card.y + 20, 30, 30);
        graphics.fill();
        
        // Color indicator
        graphics.setFillStyle({ color: card.color });
        graphics.rect(card.x + 20, card.y + 25, 20, 20);
        graphics.fill();
      } else {
        // Question mark
        graphics.setFillStyle({ color: 0x95a5a6 });
        graphics.rect(card.x + 20, card.y + 25, 20, 20);
        graphics.fill();
      }
    });
  }, [cards, flippedCards, matchedCards]);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    // UI background
    graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
    graphics.rect(0, 0, GAME_WIDTH, 50);
    graphics.fill();
  }, []);

  const titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 20,
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

  const gameOverStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    fill: 0xff6b6b,
    align: "center"
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <h1>Memory Card Game</h1>
      
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
          <MemoryGameChild 
            gameState={gameState}
            cards={cards}
            flippedCards={flippedCards}
            matchedCards={matchedCards}
            moves={moves}
            score={score}
            timeLeft={timeLeft}
            onCardClick={handleCardClick}
            drawBackground={drawBackground}
            drawCards={drawCards}
            drawUI={drawUI}
          />
          
          <pixiText
            text={`Time: ${formatTime(timeLeft)}`}
            style={uiTextStyle}
            x={10}
            y={15}
          />
          
          <pixiText
            text={`Moves: ${moves}`}
            style={uiTextStyle}
            x={GAME_WIDTH / 2 - 40}
            y={15}
          />
          
          <pixiText
            text={`Score: ${score}`}
            style={uiTextStyle}
            x={GAME_WIDTH - 80}
            y={15}
          />
          
          {gameState === 'gameOver' && (
            <>
              <pixiText
                text="GAME OVER!"
                style={gameOverStyle}
                x={GAME_WIDTH / 2}
                y={GAME_HEIGHT / 2 - 20}
                anchor={0.5}
              />
              
              <pixiText
                text={`Final Score: ${score}`}
                style={titleStyle}
                x={GAME_WIDTH / 2}
                y={GAME_HEIGHT / 2 + 20}
                anchor={0.5}
              />
            </>
          )}
          
          {/* Clickable card areas */}
          {cards.map((card, index) => (
            <pixiGraphics
              key={index}
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x000000, alpha: 0 });
                graphics.rect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
                graphics.fill();
              }}
              eventMode="static"
              onClick={() => handleCardClick(index)}
            />
          ))}
        </Application>

        <div style={{ 
          width: '200px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>How to Play</h3>
          <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.5' }}>
            <p><strong>Objective:</strong></p>
            <p>Find all matching pairs of cards before time runs out!</p>
            
            <p style={{ marginTop: '15px' }}><strong>Rules:</strong></p>
            <p>• Click cards to flip them</p>
            <p>• Find matching pairs</p>
            <p>• Complete all pairs to win</p>
            <p>• You have 2 minutes!</p>
            
            <p style={{ marginTop: '15px' }}><strong>Scoring:</strong></p>
            <p>• Each match: 10 points</p>
            <p>• Bonus for speed</p>
            <p>• Penalty for wrong moves</p>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p><strong>Current Status:</strong></p>
            <p>Matched: {matchedCards.length / 2} / {cards.length / 2}</p>
            <p>Time Left: {formatTime(timeLeft)}</p>
            <p>Moves: {moves}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Game Status:</strong> {
          gameState === 'menu' && 'Ready to start!' ||
          gameState === 'playing' && 'Playing - Click cards to find matches!' ||
          gameState === 'gameOver' && 'Game Over - Press Play Again!'
        }</p>
      </div>
    </>
  );
};

export default MemoryGame;
