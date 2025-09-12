import { Texture, Assets, Container, Sprite } from "pixi.js";
import { useEffect, useState } from "react";
import { useTick, extend } from "@pixi/react";

extend({
  Container,
  Sprite,
});

const ScaleBunnyChild = () => {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      console.log("Loading bunny texture...");
      Assets.load("https://pixijs.com/assets/bunny.png")
        .then((result) => {
          console.log("Texture loaded:", result);
          setTexture(result);
        })
        .catch((error) => {
          console.error("Failed to load texture:", error);
        });
    }
  }, [texture]);

  useTick((delta) => {
    if (typeof delta === "number" && !isNaN(delta)) {
      setRotation((prev) => {
        const newRotation = prev + 0.1 * delta;
        return newRotation;
      });

      setTime((prev) => prev + delta);
      setScale(() => {
        const newScale = 1 + 0.5 * Math.sin(time * 0.01);
        return newScale;
      });
    } else {
      setRotation((prev) => {
        const newRotation = prev + 0.03;
        return newRotation;
      });

      setTime((prev) => prev + 1);
      setScale(() => {
        const newScale = 1 + 0.5 * Math.sin(time * 0.01);
        return newScale;
      });
    }
  });

  return (
    <>
      <pixiContainer x={200} y={200} rotation={rotation} scale={scale}>
        <pixiSprite anchor={0.5} texture={texture} x={10} y={10} />
        <pixiSprite anchor={0.5} texture={texture} x={70} y={70} />
        <pixiSprite anchor={0.5} texture={texture} x={40} y={40} />
      </pixiContainer>
    </>
  );
};

export default ScaleBunnyChild;
