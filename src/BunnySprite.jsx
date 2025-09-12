import { Container, Graphics, Sprite, Assets, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { Application, extend } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
});

export function BunnySprite() {
  // The Pixi.js `Sprite`
  const spriteRef = useRef(null);

  const [texture, setTexture] = useState(Texture.EMPTY);
  const [isHovered, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  console.log("isHovered : ", isHovered);

  return (
    <>
      <h1>My bunny Stripe</h1>
      <Application>
        <pixiContainer x={100} y={100}>
          <pixiSprite
            ref={spriteRef}
            anchor={0.5}
            eventMode={"static"}
            onClick={() => setIsActive(!isActive)}
            onPointerOver={() => setIsHover(true)}
            onPointerOut={() => setIsHover(false)}
            scale={isActive ? 1 : 1.5}
            texture={texture}
            x={100}
            y={100}
          />
        </pixiContainer>
      </Application>
    </>
  );
}
