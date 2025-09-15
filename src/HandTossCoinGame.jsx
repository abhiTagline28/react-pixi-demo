import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const HandTossCoinChild = ({
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
  handTexture,
  hand2Texture,
  showCoin,
}) => {
  const [flipCount, setFlipCount] = useState(0);
  const [hand2X, setHand2X] = useState(300); // Position of hand22 (300 = covering, 500+ = revealed)

  useTick(() => {
    if (isFlipping) {
      setFlipCount((prev) => prev + 1);

      // Smooth physics with easing
      const time = flipCount * 0.016; // 60fps timing

      // Smooth trajectory using easing functions
      const easeOutQuad = (t) => t * (2 - t);
      const easeInQuad = (t) => t * t;

      // Phase-based animation with smoother transitions
      if (flipCount < 20) {
        // Hand22 moves back to reveal coin
        const moveProgress = flipCount / 20;
        const easedProgress = easeOutQuad(moveProgress);
        
        setHand2X(() => {
          const startX = 300; // Original position
          const endX = 500; // Move to the right
          return startX + (endX - startX) * easedProgress;
        });
        
        setCoinY(() => 250); // Stay on hand
        setCoinX(() => 300);
        setCoinRotation((prev) => prev + 0.1);
        setCoinScale(() => 1);
      } else if (flipCount < 70) {
        // Launch phase - coin goes from hand to top
        const launchProgress = (flipCount - 20) / 50;
        const easedProgress = easeOutQuad(launchProgress);

        setCoinY(() => {
          const startY = 250; // Start at hand position
          const endY = 60; // Go to top
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2) * 3;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 1.2);
        setCoinScale(() => 1 + Math.sin(time * 15) * 0.15);
      } else if (flipCount < 120) {
        // Peak phase - coin hovers at top
        setCoinY(() => {
          const hoverY = 60 + Math.sin(time * 5) * 6;
          return Math.max(hoverY, 55);
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.2) * 2;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 1.4);
        setCoinScale(() => 1 + Math.sin(time * 18) * 0.2);
      } else if (flipCount < 170) {
        // Fall phase - coin falls back to hand
        const fallProgress = (flipCount - 120) / 50;
        const easedProgress = easeInQuad(fallProgress);

        setCoinY(() => {
          const startY = 60;
          const endY = 250; // Back to hand
          return startY + (endY - startY) * easedProgress;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 1.8) * 1.5;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 1.0);
        setCoinScale(() => 1 + Math.sin(time * 20) * 0.18);
      } else if (flipCount < 190) {
        // Settle phase - coin settles on hand
        const settleProgress = (flipCount - 170) / 20;

        setCoinY((prev) => {
          const targetY = 250;
          const diff = targetY - prev;
          const bounce = Math.sin(settleProgress * Math.PI) * 12;
          return prev + diff * 0.25 + bounce * 0.3;
        });

        setCoinX((prev) => {
          const targetX = 300;
          const diff = targetX - prev;
          return prev + diff * 0.2;
        });

        setCoinRotation((prev) => prev + 0.4);
        setCoinScale((prev) => {
          const targetScale = 1;
          const diff = targetScale - prev;
          return prev + diff * 0.15;
        });
      }

      // End flip after animation
      if (flipCount > 190) {
        setIsFlipping(false);
        setFlipCount(0);

        // Reset hand22 position
        setHand2X(300);

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
          setCoinY(250);
          setCoinX(300);
          setHand2X(300); // Reset hand22 to cover coin
        }, 3000);
      }
    }
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      {/* Always show hand11.png (hand with coin) */}
      <pixiSprite
        texture={handTexture}
        x={300}
        y={250}
        width={200}
        height={150}
        anchor={0.5}
      />
      {/* Show hand22.png (hand without coin) - moves to cover/reveal coin */}
      <pixiSprite
        texture={hand2Texture}
        x={hand2X}
        y={250}
        width={200}
        height={150}
        anchor={0.5}
      />
      {/* Show coin only when hand22 is not covering it (hand2X > 350) and showCoin is true */}
      {showCoin && hand2X > 350 && !result && (
        <pixiGraphics draw={drawCoin} />
      )}
      {/* Show result coin when flipping is done */}
      {result && (
        <>
          <pixiGraphics draw={(graphics) => drawResultCoin(graphics, result)} />
          <pixiText
            text={result.toUpperCase()}
            x={300}
            y={320}
            anchor={0.5}
            style={{
              fontSize: 24,
              fill: 0xffffff,
              stroke: 0x000000,
              strokeThickness: 3,
              fontWeight: "bold",
            }}
          />
        </>
      )}
    </>
  );
};

const HandTossCoinGame = () => {
  const [gameState, setGameState] = useState("menu");
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(250); // Start at hand position
  const [coinX, setCoinX] = useState(300);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [handTexture, setHandTexture] = useState(Texture.EMPTY);
  const [hand2Texture, setHand2Texture] = useState(Texture.EMPTY);
  const [showCoin, setShowCoin] = useState(true);

  // Load hand textures
  useEffect(() => {
    if (handTexture === Texture.EMPTY) {
      Assets.load("/hand11.png").then((result) => {
        console.log("Hand11.png loaded successfully");
        setHandTexture(result);
      }).catch((error) => {
        console.error("Failed to load hand11 image:", error);
      });
    }
    if (hand2Texture === Texture.EMPTY) {
      Assets.load("/hand22.png").then((result) => {
        console.log("Hand22.png loaded successfully");
        setHand2Texture(result);
      }).catch((error) => {
        console.error("Failed to load hand22 image:", error);
      });
    }
  }, [handTexture, hand2Texture]);

  // Hide coin after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Hiding coin after 3 seconds");
      setShowCoin(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const flipCoin = useCallback(() => {
    if (isFlipping) return; // Prevent multiple flips

    // Show coin and start flipping
    setShowCoin(true);
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
    setCoinY(250);
    setCoinX(300);
    setShowCoin(true); // Reset to show coin initially
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
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();

    // Draw decorative border
    graphics.setStrokeStyle({ color: 0x3a3a5e, width: 4 });
    graphics.rect(10, 10, 580, 380);
    graphics.stroke();
  }, []);


  const drawCoin = useCallback(
    (graphics) => {
      graphics.clear();

      // Calculate 3D perspective based on rotation
      const perspective = Math.abs(Math.sin(coinRotation));
      const coinRadius = 35 * coinScale;
      const ellipseHeight = coinRadius * (1 - perspective * 0.7);

      // Draw coin shadow with perspective
      graphics.setFillStyle({
        color: 0x000000,
        alpha: 0.3 + perspective * 0.2,
      });
      graphics.ellipse(
        coinX + 2,
        coinY + 5,
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
        graphics.moveTo(coinX, coinY - 12 * crownScale);
        graphics.lineTo(coinX - 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX - 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX - 4 * crownScale, coinY);
        graphics.lineTo(coinX + 4 * crownScale, coinY);
        graphics.lineTo(coinX + 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX + 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX, coinY - 12 * crownScale);
        graphics.stroke();
      } else {
        // Tails - draw a "T" with perspective
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const tScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 12 * tScale);
        graphics.lineTo(coinX, coinY + 12 * tScale);
        graphics.moveTo(coinX - 12 * tScale, coinY);
        graphics.lineTo(coinX + 12 * tScale, coinY);
        graphics.stroke();
      }

      // Add highlight for 3D effect
      if (perspective < 0.5) {
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
        graphics.ellipse(
          coinX - 8,
          coinY - 8,
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
    const coinY = 250; // Show result on hand
    const coinRadius = 30;

    // Draw coin shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
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
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX - 6, coinY - 3);
      graphics.lineTo(coinX - 10, coinY + 3);
      graphics.lineTo(coinX - 3, coinY + 1);
      graphics.lineTo(coinX + 3, coinY + 1);
      graphics.lineTo(coinX + 10, coinY + 3);
      graphics.lineTo(coinX + 6, coinY - 3);
      graphics.lineTo(coinX, coinY - 10);
      graphics.stroke();
    } else {
      // Draw "T" symbol for tails
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX, coinY + 10);
      graphics.moveTo(coinX - 10, coinY);
      graphics.lineTo(coinX + 10, coinY);
      graphics.stroke();
    }

    // Add highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.5 });
    graphics.circle(coinX - 6, coinY - 6, coinRadius * 0.3);
    graphics.fill();
  }, []);

  return (
    <>
      <h1>Hand Toss Coin Game</h1>
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
            padding: "8px 15px",
            backgroundColor: isFlipping ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isFlipping ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </button>
        <button
          onClick={resetGame}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
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
        <HandTossCoinChild
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
          handTexture={handTexture}
          hand2Texture={hand2Texture}
          showCoin={showCoin}
        />
      </Application>
    </>
  );
};

export default HandTossCoinGame;
