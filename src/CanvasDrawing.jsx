import { Container, Graphics } from "pixi.js";
import { useState, useCallback, useEffect } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
});

const CanvasDrawingChild = () => {
  const [time, setTime] = useState(0);
  const [shapes, setShapes] = useState([]);

  useTick(() => {
    setTime(prev => prev + 0.02);
  });

  useEffect(() => {
    // Create animated shapes
    const newShapes = [];
    for (let i = 0; i < 20; i++) {
      newShapes.push({
        id: i,
        type: Math.random() > 0.5 ? 'circle' : 'rect',
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50,
        size: Math.random() * 30 + 10,
        color: Math.random() * 0xffffff,
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
      });
    }
    setShapes(newShapes);
  }, []);

  const drawShape = useCallback((graphics, shape) => {
    graphics.clear();
    graphics.setFillStyle({ color: shape.color });
    
    const animatedSize = shape.size + Math.sin(time * shape.speed + shape.phase) * 5;
    
    if (shape.type === 'circle') {
      graphics.circle(shape.x, shape.y, animatedSize);
    } else {
      graphics.rect(shape.x - animatedSize/2, shape.y - animatedSize/2, animatedSize, animatedSize);
    }
    graphics.fill();
  }, [time]);

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
  }, []);

  const drawGradient = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x16213e });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
    
    // Draw some gradient-like effect
    for (let i = 0; i < 10; i++) {
      graphics.setFillStyle({ color: 0x0f3460 });
      graphics.circle(300, 200, 100 + i * 20);
      graphics.fill();
    }
  }, []);

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawGradient} />
      
      {shapes.map(shape => (
        <pixiGraphics key={shape.id} draw={(graphics) => drawShape(graphics, shape)} />
      ))}
    </>
  );
};

const CanvasDrawing = () => {
  return (
    <>
      <h1>Canvas Drawing & Animation</h1>
      <Application width={600} height={400}>
        <CanvasDrawingChild />
      </Application>
    </>
  );
};

export default CanvasDrawing;
