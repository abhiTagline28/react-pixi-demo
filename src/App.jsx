import ApplicationAutoStart from "./ApplicationAutoStart";
import { BunnySprite } from "./BunnySprite";
import HelloWorldPixi from "./HelloWorldPixi";
// import MakeAnimatedSpriteTextures from "./MakeAnimatedSpriteTextures";
import MyGraphics from "./MyGraphics";
import MyPixiGraphics from "./MyPixiGraphics";
import RotateBunny from "./RotateBunny";
import ScaleBunny from "./ScaleBunny";
import ParticleSystem from "./ParticleSystem";
import TextEffects from "./TextEffects";
import PhysicsSimulation from "./PhysicsSimulation";
import TilemapExample from "./TilemapExample";
import CanvasDrawing from "./CanvasDrawing";
import WebGLShaders from "./WebGLShaders";

// Game examples
import SnakeGame from "./SnakeGame";
import BreakoutGame from "./BreakoutGame";

const App = () => {
  return (
    <>
      <MyGraphics />
      <br />
      <br />
      <ApplicationAutoStart />
      <br />
      <br />
      <MyPixiGraphics />
      <br />
      <br />
      <BunnySprite />
      <br />
      <br />
      <HelloWorldPixi />
      {/* <br />
      <br />
      <MakeAnimatedSpriteTextures /> */}
      <br />
      <br />
      <RotateBunny />
      <br />
      <br />
      <ScaleBunny />
      <br />
      <br />
      <ParticleSystem />
      <br />
      <br />
      <TextEffects />
      <br />
      <br />
      <PhysicsSimulation />
      <br />
      <br />
      <TilemapExample />
      <br />
      <br />
      <CanvasDrawing />
      <br />
      <br />
      <WebGLShaders />

      {/* Game Examples */}
      <br />
      <br />
      <SnakeGame />
      <br />
      <br />
      <BreakoutGame />
    </>
  );
};

export default App;
