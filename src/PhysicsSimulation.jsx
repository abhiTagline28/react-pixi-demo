import { Container, Graphics, Sprite, Texture, Assets } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
});

const PhysicsSimulationChild = () => {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  useEffect(() => {
    // Create physics balls
    const newBalls = [];
    for (let i = 0; i < 8; i++) {
      newBalls.push({
        id: i,
        x: Math.random() * 500 + 50,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 15 + 10,
        mass: Math.random() * 2 + 1,
        color: Math.random() * 0xffffff,
      });
    }
    setBalls(newBalls);
  }, []);

  useTick(() => {
    setBalls(prevBalls =>
      prevBalls.map(ball => {
        let newVx = ball.vx;
        let newVy = ball.vy;
        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;

        // Gravity
        newVy += 0.1;

        // Bounce off walls
        if (newX - ball.radius <= 0 || newX + ball.radius >= 600) {
          newVx = -newVx * 0.8; // Damping
          newX = newX - ball.radius <= 0 ? ball.radius : 600 - ball.radius;
        }
        if (newY - ball.radius <= 0 || newY + ball.radius >= 300) {
          newVy = -newVy * 0.8; // Damping
          newY = newY - ball.radius <= 0 ? ball.radius : 300 - ball.radius;
        }

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      })
    );
  });

  const drawBall = useCallback((graphics, ball) => {
    graphics.clear();
    graphics.setFillStyle({ color: ball.color });
    graphics.circle(ball.x, ball.y, ball.radius);
    graphics.fill();
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.circle(ball.x, ball.y, ball.radius);
    graphics.stroke();
  }, []);

  return (
    <>
      {balls.map(ball => (
        <pixiGraphics key={ball.id} draw={(graphics) => drawBall(graphics, ball)} />
      ))}
    </>
  );
};

const PhysicsSimulation = () => {
  return (
    <>
      <h1>Physics Simulation</h1>
      <Application width={600} height={300}>
        <PhysicsSimulationChild />
      </Application>
    </>
  );
};

export default PhysicsSimulation;
