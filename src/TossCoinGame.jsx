import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const TossCoinGameChild = ({
  coinRotation,
  isFlipping,
  result,
  setCoinRotation,
  setCoinScale,
  setCoinY,
  setCoinX,
  setCoinVelocityY,
  setCoinVelocityX,
  setIsFlipping,
  setResult,
  setScore,
  drawCoin,
  drawBackground,
  drawResult,
  drawResultCoin,
}) => {
  const [flipCount, setFlipCount] = useState(0);
  // const [flipPhase, setFlipPhase] = useState("launch"); // launch, peak, fall, settle

  useTick(() => {
    if (isFlipping) {
      setFlipCount((prev) => prev + 1);

      // Smooth physics with easing
      // const progress = flipCount / 120; // Extended to 120 frames for smoother animation
      const time = flipCount * 0.016; // 60fps timing

      // Smooth trajectory using easing functions
      const easeOutQuad = (t) => t * (2 - t);
      const easeInQuad = (t) => t * t;
      // const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      // Phase-based animation with smoother transitions
      if (flipCount < 30) {
        // Launch phase - smooth upward motion
        // setFlipPhase("launch");
        const launchProgress = flipCount / 30;
        const easedProgress = easeOutQuad(launchProgress);

        setCoinY(() => {
          const startY = 200;
          const endY = 120;
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2) * 3;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.6);
        setCoinScale(() => 1 + Math.sin(time * 10) * 0.08);
      } else if (flipCount < 60) {
        // Peak phase - smooth hover at maximum height
        // setFlipPhase("peak");
        // const peakProgress = (flipCount - 30) / 30;

        setCoinY(() => {
          const hoverY = 120 + Math.sin(time * 3) * 5;
          return Math.max(hoverY, 115);
        });

        setCoinX(() => {
          const drift = Math.sin(time * 1.5) * 2;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.7);
        setCoinScale(() => 1 + Math.sin(time * 12) * 0.12);
      } else if (flipCount < 100) {
        // Fall phase - smooth falling with gravity
        // setFlipPhase("fall");
        const fallProgress = (flipCount - 60) / 40;
        const easedProgress = easeInQuad(fallProgress);

        setCoinY(() => {
          const startY = 120;
          const endY = 200;
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 1.2) * 1.5;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.4);
        setCoinScale(() => 1 + Math.sin(time * 15) * 0.15);
      } else if (flipCount < 120) {
        // Settle phase - smooth settling with bounce
        // setFlipPhase("settle");
        const settleProgress = (flipCount - 100) / 20;

        setCoinY((prev) => {
          const targetY = 200;
          const diff = targetY - prev;
          const bounce = Math.sin(settleProgress * Math.PI) * 10;
          return prev + diff * 0.15 + bounce * 0.3;
        });

        setCoinX((prev) => {
          const targetX = 300;
          const diff = targetX - prev;
          return prev + diff * 0.1;
        });

        setCoinRotation((prev) => prev + 0.2);
        setCoinScale((prev) => {
          const targetScale = 1;
          const diff = targetScale - prev;
          return prev + diff * 0.08;
        });
      }

      // End flip after animation
      if (flipCount > 120) {
        setIsFlipping(false);
        setFlipCount(0);
        // setFlipPhase("launch");

        // Determine result based on final rotation
        const finalRotation = coinRotation % (Math.PI * 2);
        const coinResult = finalRotation < Math.PI ? "heads" : "tails";
        setResult(coinResult);

        // Update score
        setScore((prev) => prev + 1);

        // Show result for 3 seconds then reset
        setTimeout(() => {
          setResult(null);
          setCoinRotation(0);
          setCoinScale(1);
          setCoinY(200);
          setCoinX(300);
          setCoinVelocityY(0);
          setCoinVelocityX(0);
        }, 3000);
      }
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawCoin} />
      {result && (
        <>
          <pixiGraphics draw={drawResult} />
          <pixiGraphics draw={(graphics) => drawResultCoin(graphics, result)} />
          <pixiText
            text={result.toUpperCase()}
            x={300}
            y={320}
            anchor={0.5}
            style={{
              fontSize: 20,
              fill: 0xffffff,
              stroke: 0x000000,
              strokeThickness: 2,
              fontWeight: "bold",
            }}
          />
        </>
      )}
    </>
  );
};

const TossCoinGame = () => {
  const [gameState, setGameState] = useState("menu"); // menu, playing
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(200);
  const [coinX, setCoinX] = useState(300);
  const [coinVelocityY, setCoinVelocityY] = useState(0);
  const [coinVelocityX, setCoinVelocityX] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  const flipCoin = useCallback(() => {
    if (isFlipping) return; // Prevent multiple flips

    setIsFlipping(true);
    setResult(null);
    // Add some initial randomness to the flip
    setCoinVelocityY(-15 + Math.random() * 5);
    setCoinVelocityX((Math.random() - 0.5) * 4);
  }, [isFlipping]);

  const resetGame = useCallback(() => {
    setScore(0);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
    setIsFlipping(false);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(200);
    setCoinX(300);
    setCoinVelocityY(0);
    setCoinVelocityX(0);
  }, []);

  // Update heads/tails count when result changes
  useEffect(() => {
    if (result === "heads") {
      setHeadsCount((prev) => prev + 1);
    } else if (result === "tails") {
      setTailsCount((prev) => prev + 1);
    }
  }, [result]);

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x2a2a4e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();

    // Draw decorative border
    graphics.setStrokeStyle({ color: 0x4a4a6e, width: 4 });
    graphics.rect(10, 10, 580, 380);
    graphics.stroke();
  }, []);

  const drawCoin = useCallback(
    (graphics) => {
      graphics.clear();

      // Calculate 3D perspective based on rotation
      const perspective = Math.abs(Math.sin(coinRotation));
      const coinRadius = 40 * coinScale;
      const ellipseHeight = coinRadius * (1 - perspective * 0.7);

      // Draw coin shadow with perspective
      graphics.setFillStyle({
        color: 0x000000,
        alpha: 0.2 + perspective * 0.3,
      });
      graphics.ellipse(
        coinX + 3,
        coinY + 8,
        coinRadius * 0.8,
        ellipseHeight * 0.6
      );
      graphics.fill();

      // Draw coin edge (3D effect)
      graphics.setFillStyle({ color: 0xffb000 });
      graphics.ellipse(coinX, coinY, coinRadius, ellipseHeight);
      graphics.fill();

      // Draw coin face with gradient effect
      const gradient = perspective < 0.3 ? 0xffd700 : 0xffed4e;
      graphics.setFillStyle({ color: gradient });
      graphics.ellipse(coinX, coinY, coinRadius * 0.9, ellipseHeight * 0.9);
      graphics.fill();

      // Draw coin face based on rotation with perspective
      const face = Math.floor(coinRotation / Math.PI) % 2;
      graphics.setFillStyle({ color: 0x000000 });

      if (face === 0) {
        // Heads - draw a crown with perspective
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const crownScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 15 * crownScale);
        graphics.lineTo(coinX - 10 * crownScale, coinY - 5 * crownScale);
        graphics.lineTo(coinX - 15 * crownScale, coinY + 5 * crownScale);
        graphics.lineTo(coinX - 5 * crownScale, coinY);
        graphics.lineTo(coinX + 5 * crownScale, coinY);
        graphics.lineTo(coinX + 15 * crownScale, coinY + 5 * crownScale);
        graphics.lineTo(coinX + 10 * crownScale, coinY - 5 * crownScale);
        graphics.lineTo(coinX, coinY - 15 * crownScale);
        graphics.stroke();
      } else {
        // Tails - draw a "T" with perspective
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const tScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 15 * tScale);
        graphics.lineTo(coinX, coinY + 15 * tScale);
        graphics.moveTo(coinX - 15 * tScale, coinY);
        graphics.lineTo(coinX + 15 * tScale, coinY);
        graphics.stroke();
      }

      // Add highlight for 3D effect
      if (perspective < 0.5) {
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
        graphics.ellipse(
          coinX - 10,
          coinY - 10,
          coinRadius * 0.3,
          ellipseHeight * 0.3
        );
        graphics.fill();
      }
    },
    [coinRotation, coinScale, coinY, coinX]
  );

  const drawResult = useCallback(
    (graphics) => {
      graphics.clear();

      // Draw result background with blur effect
      graphics.setFillStyle({ color: 0x000000, alpha: 0.7 });
      graphics.rect(0, 0, 600, 400);
      graphics.fill();

      // Draw result box
      graphics.setFillStyle({ color: 0xffffff });
      graphics.rect(150, 150, 300, 100);
      graphics.fill();

      graphics.setStrokeStyle({ color: 0x000000, width: 4 });
      graphics.rect(150, 150, 300, 100);
      graphics.stroke();

      // Add sparkle effect around the result
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.9 });
      graphics.circle(180, 160, 3);
      graphics.fill();
      graphics.circle(420, 160, 2);
      graphics.fill();
      graphics.circle(180, 240, 2);
      graphics.fill();
      graphics.circle(420, 240, 3);
      graphics.fill();
      graphics.circle(300, 140, 4);
      graphics.fill();
      graphics.circle(300, 260, 3);
      graphics.fill();
    },
    [result]
  );

  const drawResultCoin = useCallback((graphics, coinResult) => {
    graphics.clear();

    const coinX = 300;
    const coinY = 190;
    const coinRadius = 35;

    // Draw coin shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
    graphics.circle(coinX + 2, coinY + 3, coinRadius * 0.9);
    graphics.fill();

    // Draw coin edge
    graphics.setFillStyle({ color: 0xffb000 });
    graphics.circle(coinX, coinY, coinRadius);
    graphics.fill();

    // Draw coin face
    graphics.setFillStyle({ color: 0xffd700 });
    graphics.circle(coinX, coinY, coinRadius * 0.9);
    graphics.fill();

    // Draw coin face based on result
    graphics.setFillStyle({ color: 0x000000 });
    graphics.setStrokeStyle({ color: 0x000000, width: 3 });

    if (coinResult === "heads") {
      // Draw crown symbol for heads
      graphics.moveTo(coinX, coinY - 12);
      graphics.lineTo(coinX - 8, coinY - 4);
      graphics.lineTo(coinX - 12, coinY + 4);
      graphics.lineTo(coinX - 4, coinY + 1);
      graphics.lineTo(coinX + 4, coinY + 1);
      graphics.lineTo(coinX + 12, coinY + 4);
      graphics.lineTo(coinX + 8, coinY - 4);
      graphics.lineTo(coinX, coinY - 12);
      graphics.stroke();
    } else {
      // Draw "T" symbol for tails
      graphics.moveTo(coinX, coinY - 12);
      graphics.lineTo(coinX, coinY + 12);
      graphics.moveTo(coinX - 12, coinY);
      graphics.lineTo(coinX + 12, coinY);
      graphics.stroke();
    }

    // Add highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
    graphics.circle(coinX - 8, coinY - 8, coinRadius * 0.3);
    graphics.fill();
  }, []);

  return (
    <>
      <h1>Toss Coin Game</h1>
      <div style={{ marginBottom: "10px" }}>
        <span>Total Flips: {score}</span>
        <span style={{ marginLeft: "20px" }}>Heads: {headsCount}</span>
        <span style={{ marginLeft: "20px" }}>Tails: {tailsCount}</span>
        <span style={{ marginLeft: "20px" }}>
          {!isFlipping && !result && "Click the coin to flip!"}
          {isFlipping && "Flipping..."}
          {result && `Result: ${result.toUpperCase()}!`}
        </span>
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          style={{
            marginLeft: "20px",
            padding: "5px 10px",
            backgroundColor: isFlipping ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isFlipping ? "not-allowed" : "pointer",
          }}
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </button>
        <button
          onClick={resetGame}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
      <Application
        width={600}
        height={400}
        eventMode="static"
        onClick={flipCoin}
        style={{ outline: "none", cursor: "pointer" }}
      >
        <TossCoinGameChild
          gameState={gameState}
          coinRotation={coinRotation}
          coinScale={coinScale}
          coinY={coinY}
          coinX={coinX}
          coinVelocityY={coinVelocityY}
          coinVelocityX={coinVelocityX}
          isFlipping={isFlipping}
          result={result}
          score={score}
          setGameState={setGameState}
          setCoinRotation={setCoinRotation}
          setCoinScale={setCoinScale}
          setCoinY={setCoinY}
          setCoinX={setCoinX}
          setCoinVelocityY={setCoinVelocityY}
          setCoinVelocityX={setCoinVelocityX}
          setIsFlipping={setIsFlipping}
          setResult={setResult}
          setScore={setScore}
          drawCoin={drawCoin}
          drawBackground={drawBackground}
          drawResult={drawResult}
          drawResultCoin={drawResultCoin}
        />
      </Application>
    </>
  );
};

export default TossCoinGame;
