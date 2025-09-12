import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const HorizontalCoinFlipChild = ({
  coinRotation,
  coinScale,
  isFlipping,
  result,
  setCoinRotation,
  setCoinScale,
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

      // Faster coin flip animation
      const time = flipCount * 0.016; // 60fps timing
      const progress = flipCount / 150; // 150 frames (2.5 seconds) for faster flip

      // Faster coin flip physics - starts fast, slows down naturally
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      // Calculate faster rotation - starts fast, slows down
      const totalRotations = 2.5; // 2.5 rotations like a real coin
      const currentRotation = easedProgress * totalRotations * Math.PI * 2;
      
      setCoinRotation(currentRotation);

      // Create faster coin flip effect
      const flipAngle = currentRotation % (Math.PI * 2);
      const edgeOnAngle = Math.abs(Math.sin(flipAngle));
      
      // Faster scaling - coin becomes thin when edge-on
      const horizontalScale = 1 - edgeOnAngle * 0.7; // Scale down to 0.3 when edge-on
      
      setCoinScale(horizontalScale);

      // End flip after animation
      if (flipCount > 150) {
        setIsFlipping(false);
        setFlipCount(0);

        // Determine result based on final rotation
        const finalRotation = currentRotation % (Math.PI * 2);
        const coinResult = finalRotation < Math.PI ? "heads" : "tails";
        setResult(coinResult);

        // Update score
        setScore((prev) => prev + 1);

        // Show result for 3 seconds then reset
        setTimeout(() => {
          setResult(null);
          setCoinRotation(0);
          setCoinScale(1);
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
            y={250}
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

const HorizontalCoinFlip = () => {
  const [gameState, setGameState] = useState("menu");
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(200); // Fixed center position
  const [coinX, setCoinX] = useState(300); // Fixed center position
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

    // Draw center circle to show coin area
    graphics.setStrokeStyle({ color: 0x4a4a6e, width: 2 });
    graphics.circle(300, 200, 60);
    graphics.stroke();
  }, []);

  const drawCoin = useCallback(
    (graphics) => {
      graphics.clear();

      // Calculate realistic 3D perspective
      const flipAngle = coinRotation % (Math.PI * 2);
      const perspective = Math.abs(Math.sin(flipAngle));
      const coinRadius = 50;
      
      // Create realistic coin dimensions
      const horizontalScale = coinScale;
      const verticalScale = 1;
      
      const ellipseWidth = coinRadius * horizontalScale;
      const ellipseHeight = coinRadius * verticalScale;

      // Draw realistic coin shadow
      graphics.setFillStyle({
        color: 0x000000,
        alpha: 0.2 + perspective * 0.3,
      });
      graphics.ellipse(
        coinX + 3,
        coinY + 6,
        ellipseWidth * 0.85,
        ellipseHeight * 0.6
      );
      graphics.fill();

      // Draw coin edge with realistic color
      graphics.setFillStyle({ color: 0xffb000 });
      graphics.ellipse(coinX, coinY, ellipseWidth, ellipseHeight);
      graphics.fill();

      // Draw coin face with color based on heads/tails
      const face = Math.floor(coinRotation / Math.PI) % 2;
      
      if (face === 0) {
        // Heads - Yellow coin
        const yellowGradient = perspective < 0.3 ? 0xffd700 : 0xffed4e;
        graphics.setFillStyle({ color: yellowGradient });
        graphics.ellipse(coinX, coinY, ellipseWidth * 0.9, ellipseHeight * 0.9);
        graphics.fill();
        
        // Draw bold "H" on yellow coin
        graphics.setFillStyle({ color: 0x000000 });
        graphics.setStrokeStyle({ color: 0x000000, width: 5 });
        
        const hScale = horizontalScale * (1 - perspective * 0.4);
        if (hScale > 0.2) { // Only draw if visible enough
          // Draw bold "H" shape
          graphics.beginPath();
          // Left vertical line
          graphics.moveTo(coinX - 15 * hScale, coinY - 20 * hScale);
          graphics.lineTo(coinX - 15 * hScale, coinY + 20 * hScale);
          // Right vertical line
          graphics.moveTo(coinX + 15 * hScale, coinY - 20 * hScale);
          graphics.lineTo(coinX + 15 * hScale, coinY + 20 * hScale);
          // Horizontal line
          graphics.moveTo(coinX - 15 * hScale, coinY);
          graphics.lineTo(coinX + 15 * hScale, coinY);
          graphics.stroke();
        }
      } else {
        // Tails - Yellow coin (same as heads)
        const yellowGradient = perspective < 0.3 ? 0xffd700 : 0xffed4e;
        graphics.setFillStyle({ color: yellowGradient });
        graphics.ellipse(coinX, coinY, ellipseWidth * 0.9, ellipseHeight * 0.9);
        graphics.fill();
        
        // Draw bold "T" on yellow coin
        graphics.setFillStyle({ color: 0x000000 });
        graphics.setStrokeStyle({ color: 0x000000, width: 5 });
        
        const tScale = horizontalScale * (1 - perspective * 0.4);
        if (tScale > 0.2) { // Only draw if visible enough
          // Draw bold "T" shape
          graphics.beginPath();
          // Vertical line
          graphics.moveTo(coinX, coinY - 20 * tScale);
          graphics.lineTo(coinX, coinY + 20 * tScale);
          // Horizontal line
          graphics.moveTo(coinX - 20 * tScale, coinY - 20 * tScale);
          graphics.lineTo(coinX + 20 * tScale, coinY - 20 * tScale);
          graphics.stroke();
        }
      }

      // Add realistic highlight
      if (perspective < 0.5) {
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
        graphics.ellipse(
          coinX - 12,
          coinY - 12,
          ellipseWidth * 0.3,
          ellipseHeight * 0.3
        );
        graphics.fill();
      }

      // Add edge highlight when coin is edge-on
      if (perspective > 0.7) {
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.2 });
        graphics.ellipse(coinX, coinY, ellipseWidth * 0.05, ellipseHeight);
        graphics.fill();
      }
    },
    [coinRotation, coinScale, coinY, coinX]
  );

  const drawResultCoin = useCallback((graphics, coinResult) => {
    graphics.clear();

    const coinX = 300;
    const coinY = 200; // Center position
    const coinRadius = 50; // Larger result coin

    // Draw coin shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
    graphics.circle(coinX + 3, coinY + 5, coinRadius * 0.9);
    graphics.fill();

    // Draw coin edge
    graphics.setFillStyle({ color: 0xffb000 });
    graphics.circle(coinX, coinY, coinRadius);
    graphics.fill();

    // Draw coin face with color based on result
    if (coinResult === "heads") {
      // Yellow coin for heads
      graphics.setFillStyle({ color: 0xffd700 });
      graphics.circle(coinX, coinY, coinRadius * 0.9);
      graphics.fill();

      // Draw bold "H" symbol for heads
      graphics.setFillStyle({ color: 0x000000 });
      graphics.setStrokeStyle({ color: 0x000000, width: 6 });
      graphics.beginPath();
      // Left vertical line
      graphics.moveTo(coinX - 18, coinY - 22);
      graphics.lineTo(coinX - 18, coinY + 22);
      // Right vertical line
      graphics.moveTo(coinX + 18, coinY - 22);
      graphics.lineTo(coinX + 18, coinY + 22);
      // Horizontal line
      graphics.moveTo(coinX - 18, coinY);
      graphics.lineTo(coinX + 18, coinY);
      graphics.stroke();
    } else {
      // Yellow coin for tails (same as heads)
      graphics.setFillStyle({ color: 0xffd700 });
      graphics.circle(coinX, coinY, coinRadius * 0.9);
      graphics.fill();

      // Draw bold "T" symbol for tails
      graphics.setFillStyle({ color: 0x000000 });
      graphics.setStrokeStyle({ color: 0x000000, width: 6 });
      graphics.beginPath();
      // Vertical line
      graphics.moveTo(coinX, coinY - 22);
      graphics.lineTo(coinX, coinY + 22);
      // Horizontal line
      graphics.moveTo(coinX - 22, coinY - 22);
      graphics.lineTo(coinX + 22, coinY - 22);
      graphics.stroke();
    }

    // Add highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.5 });
    graphics.circle(coinX - 12, coinY - 12, coinRadius * 0.4);
    graphics.fill();
  }, []);

  return (
    <>
      <h1>Horizontal Coin Flip Game</h1>
      <div style={{ marginBottom: "10px" }}>
        <span>Total Flips: {score}</span>
        <span style={{ marginLeft: "20px" }}>Heads: {headsCount}</span>
        <span style={{ marginLeft: "20px" }}>Tails: {tailsCount}</span>
        <span style={{ marginLeft: "20px" }}>
          {!isFlipping && !result && "Click the coin to flip horizontally!"}
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
        <HorizontalCoinFlipChild
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

export default HorizontalCoinFlip;
