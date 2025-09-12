import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Application, extend } from "@pixi/react";
import RotateBunnyChild from "./RotateBunnyChild";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const RotateBunny = () => {
  return (
    <>
      <h1>Rotate Bunny</h1>
      <Application>
        <RotateBunnyChild />
      </Application>
    </>
  );
};

export default RotateBunny;
