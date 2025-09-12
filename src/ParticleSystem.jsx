import {
  Container,
  Graphics,
  Texture,
  Assets,
} from "pixi.js";
import { useEffect, useState } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
});

const ParticleSystemChild = () => {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  useEffect(() => {
    // Create initial particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * 400,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        scale: Math.random() * 0.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }
    setParticles(newParticles);
  }, []);

  useTick(() => {
    setParticles((prevParticles) =>
      prevParticles.map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        // Bounce off edges
        vx: particle.x <= 0 || particle.x >= 400 ? -particle.vx : particle.vx,
        vy: particle.y <= 0 || particle.y >= 300 ? -particle.vy : particle.vy,
      }))
    );
  });

  return (
    <pixiContainer>
      {particles.map((particle, index) => (
        <pixiSprite
          key={index}
          texture={texture}
          x={particle.x}
          y={particle.y}
          scale={particle.scale}
          alpha={particle.alpha}
          anchor={0.5}
        />
      ))}
    </pixiContainer>
  );
};

const ParticleSystem = () => {
  return (
    <>
      <h1>Particle System</h1>
      <Application width={400} height={300}>
        <ParticleSystemChild />
      </Application>
    </>
  );
};

export default ParticleSystem;
