import makeAnimatedSpriteTexture from "./makeAnimatedSpriteTexture";

import { Container, AnimatedSprite } from "pixi.js";
import { Application, extend } from "@pixi/react";

extend({
  Container,
  AnimatedSprite,
});

const textures = makeAnimatedSpriteTexture();

const MakeAnimatedSpriteTextures = () => {
  return (
    <>
      <Application>
        <pixiContainer x={100} y={100}>
          <pixiAnimatedSprite
            anchor={0.5}
            textures={textures}
            // isPlaying={true}
            // initialFrame={0}
            animationSpeed={0.1}
          />
        </pixiContainer>
      </Application>
    </>
  );
};

export default MakeAnimatedSpriteTextures;
