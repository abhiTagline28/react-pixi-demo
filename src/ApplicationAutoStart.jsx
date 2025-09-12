import { Application } from "@pixi/react";

const ApplicationAutoStart = () => {
  return (
    <>
      <h1>Application Auto start</h1>
      <Application autoStart sharedTicker />
    </>
  );
};

export default ApplicationAutoStart;
