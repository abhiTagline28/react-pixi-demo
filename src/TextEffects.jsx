import { Container, Text, TextStyle, Graphics } from "pixi.js";
import { useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Text,
  Graphics,
});

const TextEffectsChild = () => {
  const [time, setTime] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);

  useTick((delta) => {
    setTime(prev => prev + delta * 0.01);
    setWaveOffset(prev => prev + delta * 0.05);
  });

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 600, 200);
    graphics.fill();
  }, []);

  const rainbowStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 48,
    fontWeight: "bold",
    fill: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"],
    stroke: "#ffffff",
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
  });

  const neonStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fontWeight: "bold",
    fill: "#00ffff",
    stroke: "#ffffff",
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#00ffff",
    dropShadowBlur: 8,
    dropShadowAngle: 0,
    dropShadowDistance: 0,
  });

  const waveStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fontWeight: "bold",
    fill: "#ff6b6b",
    stroke: "#ffffff",
    strokeThickness: 2,
  });

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      
      <pixiText
        text="Rainbow Text"
        style={rainbowStyle}
        x={300}
        y={50}
        anchor={0.5}
      />
      
      <pixiText
        text="Neon Glow"
        style={neonStyle}
        x={300}
        y={100}
        anchor={0.5}
        scale={1 + Math.sin(time) * 0.1}
      />
      
      <pixiText
        text="Wave Effect"
        style={waveStyle}
        x={300}
        y={150}
        anchor={0.5}
        rotation={Math.sin(waveOffset) * 0.1}
      />
    </>
  );
};

const TextEffects = () => {
  return (
    <>
      <h1>Text Effects Showcase</h1>
      <Application width={600} height={200}>
        <TextEffectsChild />
      </Application>
    </>
  );
};

export default TextEffects;
