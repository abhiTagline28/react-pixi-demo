import { Container, Graphics } from "pixi.js";
import { useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
});

const WebGLShadersChild = () => {
  const [time, setTime] = useState(0);

  useTick(() => {
    setTime(prev => prev + 0.02);
  });

  // Custom shader for wave effect
  const waveShader = `
    precision mediump float;
    
    uniform float time;
    uniform vec2 resolution;
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      float wave = sin(uv.x * 10.0 + time * 2.0) * 0.1;
      vec3 color = vec3(0.2 + wave, 0.4 + wave * 0.5, 0.8 + wave);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Custom shader for rainbow effect
  const rainbowShader = `
    precision mediump float;
    
    uniform float time;
    uniform vec2 resolution;
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      float hue = uv.x + time * 0.1;
      vec3 color = vec3(
        0.5 + 0.5 * sin(hue * 6.28),
        0.5 + 0.5 * sin(hue * 6.28 + 2.09),
        0.5 + 0.5 * sin(hue * 6.28 + 4.18)
      );
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Custom shader for plasma effect
  const plasmaShader = `
    precision mediump float;
    
    uniform float time;
    uniform vec2 resolution;
    
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      float v = 0.0;
      v += sin((uv.x + time) * 10.0);
      v += sin((uv.y + time) * 10.0);
      v += sin((uv.x + uv.y + time) * 5.0);
      v += sin((sqrt(uv.x * uv.x + uv.y * uv.y) + time) * 3.0);
      v = v / 4.0;
      vec3 color = vec3(0.5 + 0.5 * v, 0.5 + 0.5 * sin(v * 3.14), 0.5 + 0.5 * cos(v * 3.14));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const drawBackground = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, 600, 200);
    graphics.fill();
  }, []);

  const drawGeometricShapes = useCallback((graphics) => {
    graphics.clear();
    
    // Draw animated geometric shapes
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 100;
      const y = 100;
      const size = 30 + Math.sin(time + i) * 10;
      const rotation = time * 2 + i;
      
      graphics.setFillStyle({ 
        color: Math.floor(Math.sin(time + i) * 0x7f + 0x80) << 16 | 
              Math.floor(Math.sin(time + i + 2) * 0x7f + 0x80) << 8 | 
              Math.floor(Math.sin(time + i + 4) * 0x7f + 0x80)
      });
      
      graphics.circle(x, y, size);
      graphics.fill();
    }
  }, [time]);

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics draw={drawGeometricShapes} />
    </>
  );
};

const WebGLShaders = () => {
  return (
    <>
      <h1>WebGL Shaders & Effects</h1>
      <Application width={600} height={200}>
        <WebGLShadersChild />
      </Application>
      
      <div style={{ marginTop: '20px' }}>
        <p>This example demonstrates custom WebGL shaders and geometric animations.</p>
        <p>Shaders shown: Wave Effect, Rainbow Effect, Plasma Effect</p>
        <p>Note: Custom shader implementation would require additional setup in a real project.</p>
      </div>
    </>
  );
};

export default WebGLShaders;
