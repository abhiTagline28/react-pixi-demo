import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const BottomCoinTossChild = ({
  coinRotation,
  isFlipping,
  result,
  setCoinRotation,
  setCoinScale,
  setCoinY,
  setCoinX,
  setIsFlipping,
  setResult,
  setScore,
  drawCoin,
  drawBackground,
  drawResultCoin,
}) => {
  const [flipCount, setFlipCount] = useState(0);

  useTick(() => {
    if (isFlipping) {
      setFlipCount((prev) => prev + 1);

      // Smooth physics with easing
      const time = flipCount * 0.016; // 60fps timing

      // Smooth trajectory using easing functions
      const easeOutQuad = (t) => t * (2 - t);
      const easeInQuad = (t) => t * t;

      // Phase-based animation with smoother transitions
      if (flipCount < 40) {
        // Launch phase - coin goes from bottom to top
        const launchProgress = flipCount / 40;
        const easedProgress = easeOutQuad(launchProgress);

        setCoinY(() => {
          const startY = 320; // Start at bottom
          const endY = 80; // Go to top
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2) * 4;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.8);
        setCoinScale(() => 1 + Math.sin(time * 12) * 0.1);
      } else if (flipCount < 80) {
        // Peak phase - coin hovers at top
        setCoinY(() => {
          const hoverY = 80 + Math.sin(time * 4) * 8;
          return Math.max(hoverY, 75);
        });

        setCoinX(() => {
          const drift = Math.sin(time * 1.8) * 3;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.9);
        setCoinScale(() => 1 + Math.sin(time * 15) * 0.15);
      } else if (flipCount < 120) {
        // Fall phase - coin falls back to bottom
        const fallProgress = (flipCount - 80) / 40;
        const easedProgress = easeInQuad(fallProgress);

        setCoinY(() => {
          const startY = 80;
          const endY = 320; // Back to bottom
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 1.5) * 2;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 0.6);
        setCoinScale(() => 1 + Math.sin(time * 18) * 0.12);
      } else if (flipCount < 140) {
        // Settle phase - coin settles at bottom
        const settleProgress = (flipCount - 120) / 20;

        setCoinY((prev) => {
          const targetY = 320;
          const diff = targetY - prev;
          const bounce = Math.sin(settleProgress * Math.PI) * 15;
          return prev + diff * 0.2 + bounce * 0.4;
        });

        setCoinX((prev) => {
          const targetX = 300;
          const diff = targetX - prev;
          return prev + diff * 0.15;
        });

        setCoinRotation((prev) => prev + 0.3);
        setCoinScale((prev) => {
          const targetScale = 1;
          const diff = targetScale - prev;
          return prev + diff * 0.1;
        });
      }

      // End flip after animation
      if (flipCount > 140) {
        setIsFlipping(false);
        setFlipCount(0);

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
          setCoinY(320);
          setCoinX(300);
        }, 3000);
      }
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      {!result ? (
        <pixiGraphics draw={drawCoin} />
      ) : (
        <>
          <pixiGraphics draw={(graphics) => drawResultCoin(graphics, result)} />
          <pixiText
            text={result.toUpperCase()}
            x={300}
            y={360}
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

const BottomCoinToss = () => {
  const [gameState, setGameState] = useState("menu");
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(320); // Start at bottom
  const [coinX, setCoinX] = useState(300);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  const flipCoin = useCallback(() => {
    if (isFlipping) return; // Prevent multiple flips

    setIsFlipping(true);
    setResult(null);
  }, [isFlipping]);

  const resetGame = useCallback(() => {
    setScore(0);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
    setIsFlipping(false);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(320);
    setCoinX(300);
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

  const drawResultCoin = useCallback((graphics, coinResult) => {
    graphics.clear();

    const coinX = 300;
    const coinY = 320; // Show result at bottom
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
      <h1>Bottom Coin Toss Game</h1>
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
        <BottomCoinTossChild
          gameState={gameState}
          coinRotation={coinRotation}
          coinScale={coinScale}
          coinY={coinY}
          coinX={coinX}
          isFlipping={isFlipping}
          result={result}
          score={score}
          setGameState={setGameState}
          setCoinRotation={setCoinRotation}
          setCoinScale={setCoinScale}
          setCoinY={setCoinY}
          setCoinX={setCoinX}
          setIsFlipping={setIsFlipping}
          setResult={setResult}
          setScore={setScore}
          drawCoin={drawCoin}
          drawBackground={drawBackground}
          drawResultCoin={drawResultCoin}
        />
      </Application>
    </>
  );
};

export default BottomCoinToss;
