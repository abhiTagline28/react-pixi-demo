import { Container, Graphics, Sprite } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
});

const BreakoutGameChild = ({
  gameState,
  paddle,
  ball,
  gameOver,
  keys,
  setGameState,
  setPaddle,
  setBall,
  setBricks,
  setScore,
  setLives,
  setGameOver,
  drawPaddle,
  drawBall,
  drawBricks,
  drawBackground,
  drawGameOver,
  drawUI,
}) => {
  const [frameCount, setFrameCount] = useState(0);

  useTick(() => {
    if (gameState === "playing") {
      setFrameCount((prev) => prev + 1);

      // Handle paddle movement based on key states
      setPaddle((prevPaddle) => {
        let newX = prevPaddle.x;
        if (keys.left) {
          newX = Math.max(0, newX - 8);
        }
        if (keys.right) {
          newX = Math.min(500, newX + 8);
        }
        return { ...prevPaddle, x: newX };
      });

      // Slow down the game - update every 2 frames
      if (frameCount % 2 !== 0) return;
      // Update ball position
      setBall((prevBall) => {
        let newBall = { ...prevBall };
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;

        // Wall collisions
        if (newBall.x <= 0 || newBall.x >= 600 - 10) {
          newBall.vx = -newBall.vx;
        }
        if (newBall.y <= 0) {
          newBall.vy = -newBall.vy;
        }

        // Paddle collision
        if (
          newBall.y >= paddle.y - 10 &&
          newBall.y <= paddle.y + 20 &&
          newBall.x >= paddle.x - 5 &&
          newBall.x <= paddle.x + 100
        ) {
          newBall.vy = -Math.abs(newBall.vy);
          // Add some spin based on where ball hits paddle
          const hitPos = (newBall.x - paddle.x) / 100;
          newBall.vx = (hitPos - 0.5) * 8;
        }

        // Ball out of bounds
        if (newBall.y > 400) {
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setGameState("gameOver");
            }
            return newLives;
          });
          // Reset ball position but keep it moving
          newBall.x = 300;
          newBall.y = 300;
          newBall.vx = 3;
          newBall.vy = -3;
        }

        return newBall;
      });

      // Check brick collisions
      setBricks((prevBricks) => {
        const newBricks = [...prevBricks];

        for (let i = newBricks.length - 1; i >= 0; i--) {
          const brick = newBricks[i];
          if (
            ball.x + 10 >= brick.x &&
            ball.x <= brick.x + 60 &&
            ball.y + 10 >= brick.y &&
            ball.y <= brick.y + 20
          ) {
            newBricks.splice(i, 1);
            setScore((prev) => prev + 10);
            setBall((prevBall) => ({ ...prevBall, vy: -prevBall.vy }));
            break;
          }
        }

        // Check win condition
        if (newBricks.length === 0) {
          setGameOver(true);
          setGameState("gameOver");
        }

        return newBricks;
      });
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawBricks} />
      <pixiGraphics draw={drawPaddle} />
      <pixiGraphics draw={drawBall} />
      <pixiGraphics draw={drawUI} />
      {gameOver && <pixiGraphics draw={drawGameOver} />}
    </>
  );
};

const BreakoutGame = () => {
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameOver
  const [paddle, setPaddle] = useState({ x: 250, y: 350 });
  const [ball, setBall] = useState({ x: 300, y: 300, vx: 3, vy: -3 });
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [keys, setKeys] = useState({ left: false, right: false });

  useEffect(() => {
    // Initialize bricks
    const newBricks = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        newBricks.push({
          x: col * 60,
          y: row * 25 + 50,
          color: Math.floor(Math.random() * 0xffffff),
        });
      }
    }
    setBricks(newBricks);
  }, []);

  // Global keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameState !== "playing") return;

      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case "ArrowRight":
          event.preventDefault();
          setKeys((prev) => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case "ArrowRight":
          event.preventDefault();
          setKeys((prev) => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    setPaddle({ x: 250, y: 350 });
    setBall({ x: 300, y: 300, vx: 3, vy: -3 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameState("playing");

    // Reset bricks
    const newBricks = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        newBricks.push({
          x: col * 60,
          y: row * 25 + 50,
          color: Math.floor(Math.random() * 0xffffff),
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (gameState !== "playing") return;

      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setPaddle((prev) => ({ ...prev, x: Math.max(0, Math.min(500, x - 50)) }));
    },
    [gameState]
  );

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000033 });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
  }, []);

  const drawPaddle = useCallback(
    (graphics) => {
      graphics.clear();
      graphics.setFillStyle({ color: 0xffffff });
      graphics.rect(paddle.x, paddle.y, 100, 20);
      graphics.fill();
    },
    [paddle]
  );

  const drawBall = useCallback(
    (graphics) => {
      graphics.clear();
      graphics.setFillStyle({ color: 0xffff00 });
      graphics.circle(ball.x + 5, ball.y + 5, 5);
      graphics.fill();
    },
    [ball]
  );

  const drawBricks = useCallback(
    (graphics) => {
      graphics.clear();
      bricks.forEach((brick) => {
        graphics.setFillStyle({ color: brick.color });
        graphics.rect(brick.x, brick.y, 58, 18);
        graphics.fill();
        graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
        graphics.rect(brick.x, brick.y, 58, 18);
        graphics.stroke();
      });
    },
    [bricks]
  );

  const drawUI = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(10, 10, 100, 30);
    graphics.fill();
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(10, 10, 100, 30);
    graphics.stroke();
  }, []);

  const drawGameOver = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();

    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(150, 150, 300, 100);
    graphics.fill();

    graphics.setStrokeStyle({ color: 0x000000, width: 2 });
    graphics.rect(150, 150, 300, 100);
    graphics.stroke();
  }, []);

  return (
    <>
      <h1>Breakout Game</h1>
      <div style={{ marginBottom: "10px" }}>
        <span>Score: {score}</span>
        <span style={{ marginLeft: "20px" }}>Lives: {lives}</span>
        <span style={{ marginLeft: "20px" }}>
          {gameState === "menu" && "Press Start to begin!"}
          {gameState === "playing" &&
            "Hold LEFT/RIGHT arrow keys OR move mouse to control paddle!"}
          {gameState === "gameOver" &&
            (bricks.length === 0 ? "You Win!" : "Game Over!")}
        </span>
        <button
          onClick={startGame}
          style={{ marginLeft: "20px", padding: "5px 10px" }}
        >
          {gameState === "menu" ? "Start Game" : "Play Again"}
        </button>
      </div>
      <Application
        width={600}
        height={400}
        eventMode="static"
        onPointerMove={handlePointerMove}
        style={{ outline: "none", cursor: "crosshair" }}
      >
        <BreakoutGameChild
          gameState={gameState}
          paddle={paddle}
          ball={ball}
          bricks={bricks}
          score={score}
          lives={lives}
          gameOver={gameOver}
          keys={keys}
          setGameState={setGameState}
          setPaddle={setPaddle}
          setBall={setBall}
          setBricks={setBricks}
          setScore={setScore}
          setLives={setLives}
          setGameOver={setGameOver}
          drawPaddle={drawPaddle}
          drawBall={drawBall}
          drawBricks={drawBricks}
          drawBackground={drawBackground}
          drawGameOver={drawGameOver}
          drawUI={drawUI}
        />
      </Application>
    </>
  );
};

export default BreakoutGame;
