import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";

extend({
  Container,
  Graphics,
});

const MyPixiGraphics = () => {
  return (
    <>
      <h1>Hello Pixi Graphics</h1>
      <Application>
        <pixiContainer x={50} y={10}>
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: "red" });
              graphics.rect(0, 0, 100, 100);
              graphics.fill();
            }}
          />
        </pixiContainer>
      </Application>
    </>
  );
};

export default MyPixiGraphics;
