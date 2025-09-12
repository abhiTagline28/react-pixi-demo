import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Application, extend } from "@pixi/react";
import ScaleBunnyChild from "./ScaleBunnyChild";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const ScaleBunny = () => {
  return (
    <>
      <h1>Scale Bunny</h1>
      <Application>
        <ScaleBunnyChild />
      </Application>
    </>
  );
};

export default ScaleBunny;
