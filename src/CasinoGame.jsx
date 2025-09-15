import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Text,
});

const CASINO_WIDTH = 800;
const CASINO_HEIGHT = 500;

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_COLORS = { '♠': 0x000000, '♥': 0xff0000, '♦': 0xff0000, '♣': 0x000000 };

// Roulette numbers and colors
const ROULETTE_NUMBERS = [
  { num: 0, color: 'green' },
  { num: 1, color: 'red' }, { num: 2, color: 'black' }, { num: 3, color: 'red' },
  { num: 4, color: 'black' }, { num: 5, color: 'red' }, { num: 6, color: 'black' },
  { num: 7, color: 'red' }, { num: 8, color: 'black' }, { num: 9, color: 'red' },
  { num: 10, color: 'black' }, { num: 11, color: 'black' }, { num: 12, color: 'red' },
  { num: 13, color: 'black' }, { num: 14, color: 'red' }, { num: 15, color: 'black' },
  { num: 16, color: 'red' }, { num: 17, color: 'black' }, { num: 18, color: 'red' },
  { num: 19, color: 'red' }, { num: 20, color: 'black' }, { num: 21, color: 'red' },
  { num: 22, color: 'black' }, { num: 23, color: 'red' }, { num: 24, color: 'black' },
  { num: 25, color: 'red' }, { num: 26, color: 'black' }, { num: 27, color: 'red' },
  { num: 28, color: 'black' }, { num: 29, color: 'black' }, { num: 30, color: 'red' },
  { num: 31, color: 'black' }, { num: 32, color: 'red' }, { num: 33, color: 'black' },
  { num: 34, color: 'red' }, { num: 35, color: 'black' }, { num: 36, color: 'red' }
];

// Slot machine symbols
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];

const BlackjackGame = ({ 
  gameState, 
  playerCards, 
  dealerCards, 
  playerScore, 
  dealerScore, 
  playerMoney, 
  betAmount,
  gameResult,
  onHit,
  onStand,
  onBet,
  onNewGame,
  drawCards,
  drawTable 
}) => {
  return (
    <>
      <pixiGraphics draw={drawTable} />
      <pixiGraphics draw={drawCards} />
    </>
  );
};

const RouletteGame = ({ 
  gameState, 
  ballPosition, 
  winningNumber, 
  playerMoney, 
  betAmount,
  bets,
  onSpin,
  onBet,
  onClearBets,
  drawWheel,
  drawBets,
  drawTable 
}) => {
  return (
    <>
      <pixiGraphics draw={drawTable} />
      <pixiGraphics draw={drawWheel} />
      <pixiGraphics draw={drawBets} />
    </>
  );
};

const SlotMachineGame = ({ 
  gameState, 
  reels, 
  playerMoney, 
  betAmount,
  winAmount,
  onSpin,
  onBet,
  drawMachine,
  drawReels 
}) => {
  return (
    <>
      <pixiGraphics draw={drawMachine} />
      <pixiGraphics draw={drawReels} />
    </>
  );
};

const CasinoGameChild = ({ 
  currentGame,
  gameState,
  playerMoney,
  betAmount,
  // Blackjack props
  playerCards,
  dealerCards,
  playerScore,
  dealerScore,
  gameResult,
  // Roulette props
  ballPosition,
  winningNumber,
  bets,
  // Slot props
  reels,
  winAmount,
  // Actions
  onGameChange,
  onBetChange,
  onBlackjackHit,
  onBlackjackStand,
  onBlackjackBet,
  onBlackjackNewGame,
  onRouletteSpin,
  onRouletteBet,
  onRouletteClearBets,
  onSlotSpin,
  onSlotBet,
  drawBackground,
  drawUI,
  drawBlackjack,
  drawRoulette,
  drawSlot
}) => {
  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawUI} />
      
      {currentGame === 'blackjack' && <pixiGraphics draw={drawBlackjack} />}
      {currentGame === 'roulette' && <pixiGraphics draw={drawRoulette} />}
      {currentGame === 'slot' && <pixiGraphics draw={drawSlot} />}
    </>
  );
};

const CasinoGame = () => {
  const [currentGame, setCurrentGame] = useState('blackjack');
  const [gameState, setGameState] = useState('menu'); // menu, playing, betting, result
  const [playerMoney, setPlayerMoney] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  
  // Blackjack state
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameResult, setGameResult] = useState('');
  
  // Roulette state
  const [ballPosition, setBallPosition] = useState(0);
  const [winningNumber, setWinningNumber] = useState(null);
  const [bets, setBets] = useState({});
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Slot machine state
  const [reels, setReels] = useState([['🍒', '🍋', '🍊'], ['🍇', '🔔', '⭐'], ['💎', '7️⃣', '🍒']]);
  const [winAmount, setWinAmount] = useState(0);
  const [isSpinningSlot, setIsSpinningSlot] = useState(false);

  // Blackjack functions
  const createDeck = () => {
    const deck = [];
    for (let suit of SUITS) {
      for (let value of VALUES) {
        deck.push({ suit, value });
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const getCardValue = (card) => {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
  };

  const calculateScore = (cards) => {
    let score = 0;
    let aces = 0;
    
    for (let card of cards) {
      if (card.value === 'A') {
        aces++;
        score += 11;
      } else {
        score += getCardValue(card);
      }
    }
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const dealCard = (deck) => {
    return deck.pop();
  };

  const startBlackjack = () => {
    const deck = createDeck();
    const newPlayerCards = [dealCard(deck), dealCard(deck)];
    const newDealerCards = [dealCard(deck), dealCard(deck)];
    
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setPlayerScore(calculateScore(newPlayerCards));
    setDealerScore(calculateScore(newDealerCards));
    setGameState('playing');
    setGameResult('');
  };

  const hitBlackjack = () => {
    if (gameState !== 'playing') return;
    
    const deck = createDeck();
    const newCard = dealCard(deck);
    const newPlayerCards = [...playerCards, newCard];
    const newScore = calculateScore(newPlayerCards);
    
    setPlayerCards(newPlayerCards);
    setPlayerScore(newScore);
    
    if (newScore > 21) {
      setGameResult('Bust! You lose!');
      setPlayerMoney(prev => prev - betAmount);
      setGameState('result');
    } else if (newScore === 21) {
      standBlackjack();
    }
  };

  const standBlackjack = () => {
    if (gameState !== 'playing') return;
    
    let newDealerCards = [...dealerCards];
    let newDealerScore = calculateScore(newDealerCards);
    
    // Dealer hits until 17 or higher
    while (newDealerScore < 17) {
      const deck = createDeck();
      const newCard = dealCard(deck);
      newDealerCards.push(newCard);
      newDealerScore = calculateScore(newDealerCards);
    }
    
    setDealerCards(newDealerCards);
    setDealerScore(newDealerScore);
    
    // Determine winner
    if (newDealerScore > 21) {
      setGameResult('Dealer busts! You win!');
      setPlayerMoney(prev => prev + betAmount);
    } else if (newDealerScore > playerScore) {
      setGameResult('Dealer wins!');
      setPlayerMoney(prev => prev - betAmount);
    } else if (newDealerScore < playerScore) {
      setGameResult('You win!');
      setPlayerMoney(prev => prev + betAmount);
    } else {
      setGameResult('Push!');
    }
    
    setGameState('result');
  };

  // Roulette functions
  const spinRoulette = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setGameState('spinning');
    
    // Animate ball
    let position = 0;
    const spinInterval = setInterval(() => {
      position = (position + 1) % ROULETTE_NUMBERS.length;
      setBallPosition(position);
    }, 50);
    
    // Stop after random time
    setTimeout(() => {
      clearInterval(spinInterval);
      const winningNum = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
      setWinningNumber(winningNum);
      setIsSpinning(false);
      setGameState('result');
      
      // Check bets and pay out
      let totalWin = 0;
      Object.entries(bets).forEach(([betType, amount]) => {
        if (checkRouletteBet(betType, winningNum.num)) {
          totalWin += amount * getRoulettePayout(betType);
        }
      });
      
      setPlayerMoney(prev => prev + totalWin - Object.values(bets).reduce((a, b) => a + b, 0));
      setBets({});
    }, 2000 + Math.random() * 2000);
  };

  const checkRouletteBet = (betType, winningNumber) => {
    switch (betType) {
      case 'red':
        return ROULETTE_NUMBERS.find(n => n.num === winningNumber)?.color === 'red';
      case 'black':
        return ROULETTE_NUMBERS.find(n => n.num === winningNumber)?.color === 'black';
      case 'even':
        return winningNumber !== 0 && winningNumber % 2 === 0;
      case 'odd':
        return winningNumber % 2 === 1;
      case 'low':
        return winningNumber >= 1 && winningNumber <= 18;
      case 'high':
        return winningNumber >= 19 && winningNumber <= 36;
      default:
        return parseInt(betType) === winningNumber;
    }
  };

  const getRoulettePayout = (betType) => {
    switch (betType) {
      case 'red':
      case 'black':
      case 'even':
      case 'odd':
      case 'low':
      case 'high':
        return 2;
      default:
        return 36; // Single number
    }
  };

  const placeRouletteBet = (betType) => {
    if (gameState !== 'betting' && gameState !== 'result') return;
    
    setBets(prev => ({
      ...prev,
      [betType]: (prev[betType] || 0) + betAmount
    }));
  };

  // Slot machine functions
  const spinSlot = () => {
    if (isSpinningSlot) return;
    
    setIsSpinningSlot(true);
    setGameState('spinning');
    
    // Animate reels
    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(reel => 
        reel.map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
      ));
    }, 100);
    
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Set final reels
      const finalReels = [
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]],
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]],
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]]
      ];
      
      setReels(finalReels);
      
      // Check for wins
      const win = checkSlotWin(finalReels);
      setWinAmount(win);
      setPlayerMoney(prev => prev + win - betAmount);
      setIsSpinningSlot(false);
      setGameState('result');
    }, 2000);
  };

  const checkSlotWin = (reels) => {
    const symbols = reels.map(reel => reel[0]);
    
    // Three of a kind
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      const symbolIndex = SLOT_SYMBOLS.indexOf(symbols[0]);
      return betAmount * (symbolIndex === 7 ? 100 : symbolIndex === 6 ? 50 : 10); // 7️⃣ pays most
    }
    
    // Two of a kind
    if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      return betAmount * 2;
    }
    
    return 0;
  };

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    
    // Casino background with gradient effect
    graphics.setFillStyle({ color: 0x0a0a0a });
    graphics.rect(0, 0, CASINO_WIDTH, CASINO_HEIGHT);
    graphics.fill();
    
    // Casino carpet with realistic pattern
    graphics.setFillStyle({ color: 0x1a4d3a, alpha: 0.8 });
    graphics.rect(0, 0, CASINO_WIDTH, CASINO_HEIGHT);
    graphics.fill();
    
    // Diamond pattern overlay
    graphics.setFillStyle({ color: 0x2d5a47, alpha: 0.4 });
    for (let x = 0; x < CASINO_WIDTH; x += 60) {
      for (let y = 0; y < CASINO_HEIGHT; y += 60) {
        // Create diamond pattern
        graphics.moveTo(x + 30, y);
        graphics.lineTo(x + 60, y + 30);
        graphics.lineTo(x + 30, y + 60);
        graphics.lineTo(x, y + 30);
        graphics.lineTo(x + 30, y);
        graphics.fill();
      }
    }
    
    // Subtle lighting effects
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.05 });
    graphics.rect(0, 0, CASINO_WIDTH, 100);
    graphics.fill();
    
    // Ambient lighting from sides
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.03 });
    graphics.rect(0, 0, 50, CASINO_HEIGHT);
    graphics.rect(CASINO_WIDTH - 50, 0, 50, CASINO_HEIGHT);
    graphics.fill();
  }, []);

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    
    // Top UI bar with realistic casino styling
    graphics.setFillStyle({ color: 0x1a1a1a, alpha: 0.95 });
    graphics.rect(0, 0, CASINO_WIDTH, 70);
    graphics.fill();
    
    // Gold border
    graphics.setStrokeStyle({ color: 0xffd700, width: 3 });
    graphics.rect(0, 0, CASINO_WIDTH, 70);
    graphics.stroke();
    
    // Inner shadow effect
    graphics.setStrokeStyle({ color: 0x000000, width: 1 });
    graphics.rect(2, 2, CASINO_WIDTH - 4, 66);
    graphics.stroke();
    
    // Game selection buttons with realistic casino styling
    const games = ['blackjack', 'roulette', 'slot'];
    games.forEach((game, index) => {
      const x = 30 + index * 140;
      const y = 15;
      const width = 120;
      const height = 40;
      
      // Button shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.5 });
      graphics.rect(x + 3, y + 3, width, height);
      graphics.fill();
      
      // Button background with gradient effect
      if (currentGame === game) {
        graphics.setFillStyle({ color: 0xffd700 });
        graphics.rect(x, y, width, height);
        graphics.fill();
        
        // Inner highlight
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
        graphics.rect(x + 2, y + 2, width - 4, 15);
        graphics.fill();
      } else {
        graphics.setFillStyle({ color: 0x8b4513 });
        graphics.rect(x, y, width, height);
        graphics.fill();
        
        // Inner highlight
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.2 });
        graphics.rect(x + 2, y + 2, width - 4, 15);
        graphics.fill();
      }
      
      // Button border
      graphics.setStrokeStyle({ color: currentGame === game ? 0x000000 : 0xffd700, width: 2 });
      graphics.rect(x, y, width, height);
      graphics.stroke();
      
      // Inner border
      graphics.setStrokeStyle({ color: 0x000000, width: 1 });
      graphics.rect(x + 1, y + 1, width - 2, height - 2);
      graphics.stroke();
    });
    
    // Money display with realistic casino chip styling
    graphics.setFillStyle({ color: 0x000000, alpha: 0.9 });
    graphics.rect(CASINO_WIDTH - 220, 15, 200, 40);
    graphics.fill();
    
    // Gold border
    graphics.setStrokeStyle({ color: 0xffd700, width: 3 });
    graphics.rect(CASINO_WIDTH - 220, 15, 200, 40);
    graphics.stroke();
    
    // Inner shadow
    graphics.setStrokeStyle({ color: 0x000000, width: 1 });
    graphics.rect(CASINO_WIDTH - 218, 17, 196, 36);
    graphics.stroke();
    
    // Decorative elements
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.3 });
    graphics.rect(CASINO_WIDTH - 215, 20, 190, 5);
    graphics.fill();
  }, [currentGame]);

  const drawBlackjack = useCallback((graphics) => {
    graphics.clear();
    
    // Blackjack table with realistic felt texture
    graphics.setFillStyle({ color: 0x1a5f3a });
    graphics.rect(50, 100, 700, 300);
    graphics.fill();
    
    // Table border with realistic wood effect
    graphics.setFillStyle({ color: 0x8b4513 });
    graphics.rect(45, 95, 710, 310);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0x1a5f3a });
    graphics.rect(50, 100, 700, 300);
    graphics.fill();
    
    // Inner table border
    graphics.setStrokeStyle({ color: 0x654321, width: 6 });
    graphics.rect(50, 100, 700, 300);
    graphics.stroke();
    
    // Table felt pattern
    graphics.setFillStyle({ color: 0x2d7a4a, alpha: 0.3 });
    for (let x = 60; x < 740; x += 20) {
      for (let y = 110; y < 390; y += 20) {
        if ((x + y) % 40 === 0) {
          graphics.rect(x, y, 10, 10);
        }
      }
    }
    graphics.fill();
    
    // Player betting area
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
    graphics.rect(100, 250, 300, 100);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 2 });
    graphics.rect(100, 250, 300, 100);
    graphics.stroke();
    
    // Dealer betting area
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
    graphics.rect(400, 150, 300, 100);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 2 });
    graphics.rect(400, 150, 300, 100);
    graphics.stroke();
    
    // Draw realistic cards with shadows and details
    playerCards.forEach((card, index) => {
      const x = 120 + index * 45;
      const y = 270;
      
      // Card shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
      graphics.rect(x + 2, y + 2, 35, 50);
      graphics.fill();
      
      // Card background
      graphics.setFillStyle({ color: 0xffffff });
      graphics.rect(x, y, 35, 50);
      graphics.fill();
      
      // Card border
      graphics.setStrokeStyle({ color: 0x000000, width: 2 });
      graphics.rect(x, y, 35, 50);
      graphics.stroke();
      
      // Inner card border
      graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
      graphics.rect(x + 1, y + 1, 33, 48);
      graphics.stroke();
      
      // Card corner decorations
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 2, y + 2, 8, 8);
      graphics.fill();
      
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 25, y + 40, 8, 8);
      graphics.fill();
      
      // Card center symbol
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 12, y + 20, 11, 10);
      graphics.fill();
    });
    
    dealerCards.forEach((card, index) => {
      const x = 420 + index * 45;
      const y = 170;
      
      // Card shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
      graphics.rect(x + 2, y + 2, 35, 50);
      graphics.fill();
      
      // Card background
      graphics.setFillStyle({ color: 0xffffff });
      graphics.rect(x, y, 35, 50);
      graphics.fill();
      
      // Card border
      graphics.setStrokeStyle({ color: 0x000000, width: 2 });
      graphics.rect(x, y, 35, 50);
      graphics.stroke();
      
      // Inner card border
      graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
      graphics.rect(x + 1, y + 1, 33, 48);
      graphics.stroke();
      
      // Card corner decorations
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 2, y + 2, 8, 8);
      graphics.fill();
      
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 25, y + 40, 8, 8);
      graphics.fill();
      
      // Card center symbol
      graphics.setFillStyle({ color: SUIT_COLORS[card.suit] });
      graphics.rect(x + 12, y + 20, 11, 10);
      graphics.fill();
    });
    
    // Table center decoration
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.2 });
    graphics.circle(400, 250, 30);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 2 });
    graphics.circle(400, 250, 30);
    graphics.stroke();
  }, [playerCards, dealerCards]);

  const drawRoulette = useCallback((graphics) => {
    graphics.clear();
    
    // Roulette table background
    graphics.setFillStyle({ color: 0x1a5f3a });
    graphics.rect(50, 100, 700, 350);
    graphics.fill();
    
    // Table border
    graphics.setFillStyle({ color: 0x8b4513 });
    graphics.rect(45, 95, 710, 360);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0x1a5f3a });
    graphics.rect(50, 100, 700, 350);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x654321, width: 6 });
    graphics.rect(50, 100, 700, 350);
    graphics.stroke();
    
    // Roulette wheel with realistic 3D effect
    const centerX = CASINO_WIDTH / 2;
    const centerY = 200;
    const radius = 100;
    
    // Wheel outer rim
    graphics.setFillStyle({ color: 0x654321 });
    graphics.circle(centerX, centerY, radius + 15);
    graphics.fill();
    
    // Wheel inner rim
    graphics.setFillStyle({ color: 0x8b4513 });
    graphics.circle(centerX, centerY, radius + 10);
    graphics.fill();
    
    // Wheel segments with realistic colors and borders
    ROULETTE_NUMBERS.forEach((number, index) => {
      const angle = (index / ROULETTE_NUMBERS.length) * Math.PI * 2;
      const startAngle = angle;
      const endAngle = angle + (Math.PI * 2 / ROULETTE_NUMBERS.length);
      
      // Segment background
      graphics.setFillStyle({ 
        color: number.color === 'red' ? 0xcc0000 : 
               number.color === 'black' ? 0x000000 : 0x00aa00 
      });
      graphics.moveTo(centerX, centerY);
      graphics.arc(centerX, centerY, radius, startAngle, endAngle);
      graphics.fill();
      
      // Segment border
      graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
      graphics.moveTo(centerX, centerY);
      graphics.arc(centerX, centerY, radius, startAngle, endAngle);
      graphics.stroke();
      
      // Inner segment border
      graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
      graphics.moveTo(centerX, centerY);
      graphics.arc(centerX, centerY, radius - 5, startAngle, endAngle);
      graphics.stroke();
    });
    
    // Wheel center hub
    graphics.setFillStyle({ color: 0x654321 });
    graphics.circle(centerX, centerY, 20);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 3 });
    graphics.circle(centerX, centerY, 20);
    graphics.stroke();
    
    // Animated ball with realistic physics
    if (isSpinning) {
      const ballAngle = (ballPosition / ROULETTE_NUMBERS.length) * Math.PI * 2;
      const ballRadius = radius - 25;
      const ballX = centerX + Math.cos(ballAngle) * ballRadius;
      const ballY = centerY + Math.sin(ballAngle) * ballRadius;
      
      // Ball shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
      graphics.circle(ballX + 2, ballY + 2, 6);
      graphics.fill();
      
      // Ball with metallic effect
      graphics.setFillStyle({ color: 0xffffff });
      graphics.circle(ballX, ballY, 6);
      graphics.fill();
      
      graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
      graphics.circle(ballX, ballY, 6);
      graphics.stroke();
      
      // Ball highlight
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.5 });
      graphics.circle(ballX - 1, ballY - 1, 2);
      graphics.fill();
    }
    
    // Betting area with realistic casino layout
    graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
    graphics.rect(50, 320, 700, 120);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 3 });
    graphics.rect(50, 320, 700, 120);
    graphics.stroke();
    
    // Betting grid
    graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
    for (let x = 60; x < 740; x += 40) {
      graphics.moveTo(x, 330);
      graphics.lineTo(x, 430);
    }
    for (let y = 330; y < 430; y += 20) {
      graphics.moveTo(60, y);
      graphics.lineTo(740, y);
    }
    graphics.stroke();
    
    // Betting area labels
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.8 });
    graphics.rect(70, 340, 60, 20);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.8 });
    graphics.rect(140, 340, 60, 20);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.8 });
    graphics.rect(210, 340, 60, 20);
    graphics.fill();
  }, [ballPosition, isSpinning]);

  const drawSlot = useCallback((graphics) => {
    graphics.clear();
    
    // Slot machine base with realistic 3D effect
    graphics.setFillStyle({ color: 0x654321 });
    graphics.rect(190, 90, 420, 320);
    graphics.fill();
    
    // Slot machine main body with metallic effect
    graphics.setFillStyle({ color: 0xffd700 });
    graphics.rect(200, 100, 400, 300);
    graphics.fill();
    
    // Inner shadow for depth
    graphics.setFillStyle({ color: 0x000000, alpha: 0.2 });
    graphics.rect(200, 100, 400, 20);
    graphics.fill();
    
    // Outer border with realistic wood effect
    graphics.setStrokeStyle({ color: 0x8b4513, width: 8 });
    graphics.rect(200, 100, 400, 300);
    graphics.stroke();
    
    // Inner border
    graphics.setStrokeStyle({ color: 0x654321, width: 4 });
    graphics.rect(210, 110, 380, 280);
    graphics.stroke();
    
    // Slot machine top panel
    graphics.setFillStyle({ color: 0x1a1a1a });
    graphics.rect(220, 120, 360, 40);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 2 });
    graphics.rect(220, 120, 360, 40);
    graphics.stroke();
    
    // Reel windows with realistic glass effect
    for (let i = 0; i < 3; i++) {
      const x = 250 + i * 100;
      const y = 180;
      
      // Window frame
      graphics.setFillStyle({ color: 0x000000 });
      graphics.rect(x - 5, y - 5, 90, 110);
      graphics.fill();
      
      // Glass effect
      graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
      graphics.rect(x, y, 80, 100);
      graphics.fill();
      
      // Glass border
      graphics.setStrokeStyle({ color: 0xffffff, width: 3 });
      graphics.rect(x, y, 80, 100);
      graphics.stroke();
      
      // Inner glass border
      graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
      graphics.rect(x + 2, y + 2, 76, 96);
      graphics.stroke();
      
      // Glass highlight
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
      graphics.rect(x + 2, y + 2, 76, 20);
      graphics.fill();
      
      // Symbol display area
      graphics.setFillStyle({ color: 0x1a1a1a });
      graphics.rect(x + 10, y + 30, 60, 40);
      graphics.fill();
      
      // Symbol placeholder with realistic styling
      graphics.setFillStyle({ color: 0xffff00 });
      graphics.rect(x + 15, y + 35, 50, 30);
      graphics.fill();
      
      graphics.setStrokeStyle({ color: 0xffaa00, width: 2 });
      graphics.rect(x + 15, y + 35, 50, 30);
      graphics.stroke();
    }
    
    // Slot machine bottom panel
    graphics.setFillStyle({ color: 0x1a1a1a });
    graphics.rect(220, 300, 360, 80);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffd700, width: 2 });
    graphics.rect(220, 300, 360, 80);
    graphics.stroke();
    
    // Coin slot
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(350, 320, 100, 20);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
    graphics.rect(350, 320, 100, 20);
    graphics.stroke();
    
    // Realistic lever with 3D effect
    graphics.setFillStyle({ color: 0x654321 });
    graphics.rect(650, 150, 30, 120);
    graphics.fill();
    
    // Lever shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
    graphics.rect(655, 155, 20, 110);
    graphics.fill();
    
    // Lever highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.2 });
    graphics.rect(650, 150, 30, 20);
    graphics.fill();
    
    // Lever handle
    graphics.setFillStyle({ color: 0x8b4513 });
    graphics.rect(660, 140, 10, 20);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x654321, width: 2 });
    graphics.rect(660, 140, 10, 20);
    graphics.stroke();
    
    // Decorative elements
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.5 });
    graphics.rect(230, 130, 340, 5);
    graphics.fill();
    
    graphics.setFillStyle({ color: 0xffd700, alpha: 0.5 });
    graphics.rect(230, 370, 340, 5);
    graphics.fill();
  }, [reels]);

  const titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    fill: 0xffd700,
    align: "center"
  });

  const uiTextStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: 0xffffff,
    align: "center"
  });

  const buttonStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffffff,
    align: "center"
  });

  return (
    <>
      <h1>Casino Game Suite</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setCurrentGame('blackjack')}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: currentGame === 'blackjack' ? '#ffd700' : '#8b4513',
            color: currentGame === 'blackjack' ? '#000000' : '#ffffff',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: currentGame === 'blackjack' ? '0 4px 8px rgba(255, 215, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Blackjack
        </button>
        
        <button 
          onClick={() => setCurrentGame('roulette')}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: currentGame === 'roulette' ? '#ffd700' : '#8b4513',
            color: currentGame === 'roulette' ? '#000000' : '#ffffff',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: currentGame === 'roulette' ? '0 4px 8px rgba(255, 215, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Roulette
        </button>
        
        <button 
          onClick={() => setCurrentGame('slot')}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: currentGame === 'slot' ? '#ffd700' : '#8b4513',
            color: currentGame === 'slot' ? '#000000' : '#ffffff',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: currentGame === 'slot' ? '0 4px 8px rgba(255, 215, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Slot Machine
        </button>
        
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#ffffff', fontSize: '14px' }}>Bet:</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={playerMoney}
            style={{ 
              width: '60px', 
              padding: '4px', 
              borderRadius: '4px', 
              border: '1px solid #ccc' 
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Application 
          width={CASINO_WIDTH} 
          height={CASINO_HEIGHT}
          eventMode="static"
          style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
        >
          <CasinoGameChild 
            currentGame={currentGame}
            gameState={gameState}
            playerMoney={playerMoney}
            betAmount={betAmount}
            playerCards={playerCards}
            dealerCards={dealerCards}
            playerScore={playerScore}
            dealerScore={dealerScore}
            gameResult={gameResult}
            ballPosition={ballPosition}
            winningNumber={winningNumber}
            bets={bets}
            reels={reels}
            winAmount={winAmount}
            onGameChange={setCurrentGame}
            onBetChange={setBetAmount}
            onBlackjackHit={hitBlackjack}
            onBlackjackStand={standBlackjack}
            onBlackjackBet={() => setGameState('betting')}
            onBlackjackNewGame={startBlackjack}
            onRouletteSpin={spinRoulette}
            onRouletteBet={placeRouletteBet}
            onRouletteClearBets={() => setBets({})}
            onSlotSpin={spinSlot}
            onSlotBet={() => setGameState('betting')}
            drawBackground={drawBackground}
            drawUI={drawUI}
            drawBlackjack={drawBlackjack}
            drawRoulette={drawRoulette}
            drawSlot={drawSlot}
          />
          
          {/* Game titles */}
          <pixiText
            text={currentGame === 'blackjack' ? 'BLACKJACK' : 
                  currentGame === 'roulette' ? 'ROULETTE' : 'SLOT MACHINE'}
            style={titleStyle}
            x={CASINO_WIDTH / 2}
            y={80}
            anchor={0.5}
          />
          
          {/* Money display */}
          <pixiText
            text={`$${playerMoney}`}
            style={uiTextStyle}
            x={CASINO_WIDTH - 110}
            y={30}
            anchor={0.5}
          />
          
          {/* Game-specific UI */}
          {currentGame === 'blackjack' && (
            <>
              <pixiText
                text={`Player: ${playerScore}`}
                style={uiTextStyle}
                x={250}
                y={230}
                anchor={0.5}
              />
              <pixiText
                text={`Dealer: ${dealerScore}`}
                style={uiTextStyle}
                x={550}
                y={130}
                anchor={0.5}
              />
              {gameResult && (
                <pixiText
                  text={gameResult}
                  style={titleStyle}
                  x={CASINO_WIDTH / 2}
                  y={420}
                  anchor={0.5}
                />
              )}
            </>
          )}
          
          {currentGame === 'roulette' && (
            <>
              {winningNumber && (
                <pixiText
                  text={`Winner: ${winningNumber.num}`}
                  style={titleStyle}
                  x={CASINO_WIDTH / 2}
                  y={420}
                  anchor={0.5}
                />
              )}
            </>
          )}
          
          {currentGame === 'slot' && (
            <>
              {winAmount > 0 && (
                <pixiText
                  text={`WIN: $${winAmount}`}
                  style={titleStyle}
                  x={CASINO_WIDTH / 2}
                  y={420}
                  anchor={0.5}
                />
              )}
            </>
          )}
        </Application>

        <div style={{ 
          width: '280px', 
          padding: '25px', 
          backgroundColor: '#0a0a0a', 
          borderRadius: '12px',
          border: '3px solid #ffd700',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>
            {currentGame === 'blackjack' ? 'Blackjack Rules' :
             currentGame === 'roulette' ? 'Roulette Rules' : 'Slot Machine Rules'}
          </h3>
          
          {currentGame === 'blackjack' && (
            <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
              <p><strong>Objective:</strong> Get as close to 21 as possible without going over.</p>
              <p><strong>Cards:</strong> Aces = 1 or 11, Face cards = 10</p>
              <p><strong>Actions:</strong></p>
              <p>• Hit: Take another card</p>
              <p>• Stand: Keep current hand</p>
              <p>• Dealer hits until 17+</p>
            </div>
          )}
          
          {currentGame === 'roulette' && (
            <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
              <p><strong>Objective:</strong> Bet on where the ball will land.</p>
              <p><strong>Bet Types:</strong></p>
              <p>• Red/Black: 2x payout</p>
              <p>• Even/Odd: 2x payout</p>
              <p>• Low (1-18): 2x payout</p>
              <p>• High (19-36): 2x payout</p>
              <p>• Single number: 36x payout</p>
            </div>
          )}
          
          {currentGame === 'slot' && (
            <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
              <p><strong>Objective:</strong> Match symbols across the reels.</p>
              <p><strong>Payouts:</strong></p>
              <p>• Three of a kind: 10x-100x</p>
              <p>• Two of a kind: 2x</p>
              <p>• 7️⃣ pays highest!</p>
            </div>
          )}
          
          <div style={{ marginTop: '20px', fontSize: '12px' }}>
            <p><strong>Current Money:</strong> ${playerMoney}</p>
            <p><strong>Current Bet:</strong> ${betAmount}</p>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            {currentGame === 'blackjack' && (
              <>
                <button 
                  onClick={startBlackjack}
                  disabled={gameState === 'playing'}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    backgroundColor: gameState === 'playing' ? '#444' : '#1a5f3a',
                    color: '#ffffff',
                    border: '2px solid #ffd700',
                    borderRadius: '8px',
                    cursor: gameState === 'playing' ? 'not-allowed' : 'pointer',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: gameState === 'playing' ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    background: gameState === 'playing' ? '#444' : 'linear-gradient(145deg, #2d7a4a 0%, #1a5f3a 100%)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Deal Cards
                </button>
                <button 
                  onClick={hitBlackjack}
                  disabled={gameState !== 'playing'}
                  style={{ 
                    width: '48%',
                    padding: '8px', 
                    backgroundColor: gameState !== 'playing' ? '#666' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: gameState !== 'playing' ? 'not-allowed' : 'pointer',
                    marginRight: '2%'
                  }}
                >
                  Hit
                </button>
                <button 
                  onClick={standBlackjack}
                  disabled={gameState !== 'playing'}
                  style={{ 
                    width: '48%',
                    padding: '8px', 
                    backgroundColor: gameState !== 'playing' ? '#666' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: gameState !== 'playing' ? 'not-allowed' : 'pointer'
                  }}
                >
                  Stand
                </button>
              </>
            )}
            
            {currentGame === 'roulette' && (
              <>
                <button 
                  onClick={spinRoulette}
                  disabled={isSpinning}
                  style={{ 
                    width: '100%',
                    padding: '8px', 
                    backgroundColor: isSpinning ? '#666' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    marginBottom: '10px'
                  }}
                >
                  {isSpinning ? 'Spinning...' : 'Spin Wheel'}
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {['red', 'black', 'even', 'odd', 'low', 'high'].map(betType => (
                    <button 
                      key={betType}
                      onClick={() => placeRouletteBet(betType)}
                      disabled={isSpinning}
                      style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSpinning ? 'not-allowed' : 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      {betType}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {currentGame === 'slot' && (
              <button 
                onClick={spinSlot}
                disabled={isSpinningSlot}
                style={{ 
                  width: '100%',
                  padding: '8px', 
                  backgroundColor: isSpinningSlot ? '#666' : '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSpinningSlot ? 'not-allowed' : 'pointer'
                }}
              >
                {isSpinningSlot ? 'Spinning...' : 'SPIN!'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Casino Status:</strong> {
          gameState === 'menu' && 'Choose a game and place your bet!' ||
          gameState === 'betting' && 'Place your bet and start playing!' ||
          gameState === 'playing' && 'Game in progress!' ||
          gameState === 'spinning' && 'Spinning...' ||
          gameState === 'result' && 'Check your results!'
        }</p>
      </div>
    </>
  );
};

export default CasinoGame;
