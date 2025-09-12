import {
  Container,
  Graphics,
  Sprite,
  BlurFilter,
  TextStyle,
  Text,
  Texture,
  Assets,
} from "pixi.js";
import { useEffect, useMemo, useState } from "react";
import { Application, extend } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const HelloWorldPixi = () => {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const blurFilter = useMemo(() => new BlurFilter(2), []);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  return (
    <>
      <h1>Hello World Pixi</h1>
      <Application>
        {/* <pixiContainer x={800} y={600} options={{ background: 0x1099bb }}> */}
        {/* <pixiContainer x={800} y={600}> */}
        <pixiSprite texture={texture} x={300} y={150} />
        <pixiSprite texture={texture} x={500} y={150} />
        <pixiSprite texture={texture} x={400} y={200} />
        {/* </pixiContainer> */}

        <pixiContainer x={200} y={200}>
          <pixiText
            text="Hello World"
            anchor={0.5}
            x={220}
            y={150}
            filters={[blurFilter]}
            style={
              new TextStyle({
                align: "center",
                fill: "0xffffff",
                fontSize: 50,
                letterSpacing: 20,
                dropShadow: true,
                dropShadowColor: "#E72264",
                dropShadowDistance: 6,
              })
            }
          />
        </pixiContainer>
      </Application>
    </>
  );
};

export default HelloWorldPixi;
