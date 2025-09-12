import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";

extend({
  Container,
  Graphics,
});

const MyGraphics = () => {
  const drawCallback = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: "red" });
    graphics.rect(0, 0, 100, 100);
    graphics.fill();
  }, []);

  return (
    <>
      <h1>Hello Graphics</h1>
      <Application>
        <pixiContainer x={100} y={100}>
          <pixiGraphics draw={drawCallback} />
        </pixiContainer>
      </Application>
    </>
  );
};

export default MyGraphics;
