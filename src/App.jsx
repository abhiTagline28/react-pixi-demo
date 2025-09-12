import ApplicationAutoStart from "./ApplicationAutoStart";
import { BunnySprite } from "./BunnySprite";
import HelloWorldPixi from "./HelloWorldPixi";
// import MakeAnimatedSpriteTextures from "./MakeAnimatedSpriteTextures";
import MyGraphics from "./MyGraphics";
import MyPixiGraphics from "./MyPixiGraphics";
import RotateBunny from "./RotateBunny";

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
    </>
  );
};

export default App;
