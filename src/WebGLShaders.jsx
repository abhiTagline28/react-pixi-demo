import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle, Filter } from 'pixi.js';

extend({ Container, Graphics, Text });

const WebGLShaders = () => {
  const [shaderType, setShaderType] = useState('wave');
  const [animationTime, setAnimationTime] = useState(0);
  const [shaderParams, setShaderParams] = useState({
    frequency: 0.02,
    amplitude: 50,
    speed: 1,
    colorShift: 0,
    distortion: 0.1,
  });

  const AnimationController = () => {
    useTick(() => {
      setAnimationTime(prev => prev + 0.1);
    });
    
    return null;
  };

  // Wave Shader
  const createWaveShader = useCallback(() => {
    const vertexShader = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat3 projectionMatrix;
      uniform float time;
      uniform float frequency;
      uniform float amplitude;
      
      varying vec2 vTextureCoord;
      
      void main(void) {
        vec3 position = vec3(aVertexPosition, 1.0);
        
        // Apply wave distortion
        position.y += sin(position.x * frequency + time) * amplitude;
        
        gl_Position = vec4((projectionMatrix * position).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      
      varying vec2 vTextureCoord;
      uniform float time;
      uniform float colorShift;
      
      void main(void) {
        vec2 uv = vTextureCoord;
        
        // Create wave pattern
        float wave = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
        
        // Color shifting
        vec3 color = vec3(
          sin(time + colorShift) * 0.5 + 0.5,
          sin(time + colorShift + 2.0) * 0.5 + 0.5,
          sin(time + colorShift + 4.0) * 0.5 + 0.5
        );
        
        gl_FragColor = vec4(color * wave, 1.0);
      }
    `;

    return { vertexShader, fragmentShader };
  }, []);

  // Fractal Shader
  const createFractalShader = useCallback(() => {
    const vertexShader = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat3 projectionMatrix;
      
      varying vec2 vTextureCoord;
      
      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      
      varying vec2 vTextureCoord;
      uniform float time;
      uniform float distortion;
      
      void main(void) {
        vec2 uv = vTextureCoord * 2.0 - 1.0;
        uv.x *= 1.5;
        
        float time2 = time * 0.5;
        
        // Mandelbrot-like fractal
        vec2 c = uv * 2.0;
        vec2 z = vec2(0.0);
        
        float iter = 0.0;
        float maxIter = 50.0;
        
        for (float i = 0.0; i < maxIter; i++) {
          if (dot(z, z) > 4.0) break;
          
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          iter = i;
        }
        
        float t = iter / maxIter;
        
        // Color mapping
        vec3 color = vec3(
          sin(t * 6.28 + time2) * 0.5 + 0.5,
          sin(t * 6.28 + time2 + 2.0) * 0.5 + 0.5,
          sin(t * 6.28 + time2 + 4.0) * 0.5 + 0.5
        );
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return { vertexShader, fragmentShader };
  }, []);

  // Plasma Shader
  const createPlasmaShader = useCallback(() => {
    const vertexShader = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat3 projectionMatrix;
      
      varying vec2 vTextureCoord;
      
      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      
      varying vec2 vTextureCoord;
      uniform float time;
      
      void main(void) {
        vec2 uv = vTextureCoord;
        
        // Create plasma effect
        float v = 0.0;
        v += sin((uv.x + time * 0.5) * 10.0);
        v += sin((uv.y + time * 0.3) * 10.0);
        v += sin((uv.x + uv.y + time * 0.2) * 10.0);
        v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) + time * 0.1);
        
        v = v * 0.5;
        
        // Color mapping
        vec3 color = vec3(
          sin(v * 3.14159),
          sin(v * 3.14159 + 2.0),
          sin(v * 3.14159 + 4.0)
        );
        
        gl_FragColor = vec4(color * 0.5 + 0.5, 1.0);
      }
    `;

    return { vertexShader, fragmentShader };
  }, []);

  // Noise Shader
  const createNoiseShader = useCallback(() => {
    const vertexShader = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat3 projectionMatrix;
      
      varying vec2 vTextureCoord;
      
      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      
      varying vec2 vTextureCoord;
      uniform float time;
      
      // Simple noise function
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main(void) {
        vec2 uv = vTextureCoord;
        
        // Animated noise
        float n = noise(uv * 10.0 + time * 0.1);
        
        // Color based on noise
        vec3 color = vec3(n);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return { vertexShader, fragmentShader };
  }, []);

  const drawShaderBackground = useCallback((graphics) => {
    graphics.clear();
    
    // Create a large rectangle for the shader
    graphics.setFillStyle({ color: 0x000000 });
    graphics.rect(0, 0, 800, 500);
    graphics.fill();
  }, []);

  const drawShaderControls = useCallback((graphics) => {
    graphics.clear();
    
    // Control panel background
    graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
    graphics.rect(20, 20, 200, 200);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
    graphics.rect(20, 20, 200, 200);
    graphics.stroke();
  }, []);

  const drawShaderInfo = useCallback((graphics) => {
    graphics.clear();
    
    // Info panel background
    graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
    graphics.rect(580, 20, 200, 150);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
    graphics.rect(580, 20, 200, 150);
    graphics.stroke();
  }, []);

  const getCurrentShader = useCallback(() => {
    switch (shaderType) {
      case 'wave':
        return createWaveShader();
      case 'fractal':
        return createFractalShader();
      case 'plasma':
        return createPlasmaShader();
      case 'noise':
        return createNoiseShader();
      default:
        return createWaveShader();
    }
  }, [shaderType, createWaveShader, createFractalShader, createPlasmaShader, createNoiseShader]);

  const updateShaderParam = (param, value) => {
    setShaderParams(prev => ({
      ...prev,
      [param]: parseFloat(value)
    }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        WebGL Shader Effects
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setShaderType('wave')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: shaderType === 'wave' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Wave
        </button>
        <button 
          onClick={() => setShaderType('fractal')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: shaderType === 'fractal' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fractal
        </button>
        <button 
          onClick={() => setShaderType('plasma')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: shaderType === 'plasma' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Plasma
        </button>
        <button 
          onClick={() => setShaderType('noise')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: shaderType === 'noise' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Noise
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {shaderType === 'wave' && (
          <>
            <label style={{ color: '#6c757d' }}>
              Frequency: {shaderParams.frequency.toFixed(3)}
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={shaderParams.frequency}
                onChange={(e) => updateShaderParam('frequency', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
            <label style={{ color: '#6c757d' }}>
              Amplitude: {shaderParams.amplitude.toFixed(0)}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={shaderParams.amplitude}
                onChange={(e) => updateShaderParam('amplitude', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
            <label style={{ color: '#6c757d' }}>
              Color Shift: {shaderParams.colorShift.toFixed(1)}
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={shaderParams.colorShift}
                onChange={(e) => updateShaderParam('colorShift', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
          </>
        )}
        {shaderType === 'fractal' && (
          <label style={{ color: '#6c757d' }}>
            Distortion: {shaderParams.distortion.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={shaderParams.distortion}
              onChange={(e) => updateShaderParam('distortion', e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        )}
      </div>

      <div style={{ 
        width: '800px', 
        height: '500px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={800} height={500} backgroundColor={0x000000}>
          <AnimationController />
          {/* Background */}
          <pixiGraphics draw={drawShaderBackground} />
          
          {/* Title */}
          <pixiText
            text={`${shaderType.charAt(0).toUpperCase() + shaderType.slice(1)} Shader Effect`}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xffffff,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={400}
            y={30}
            anchor={0.5}
          />
          
          {/* Shader Display Area */}
          <pixiContainer x={0} y={0}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                
                // Create shader effect using graphics
                const time = animationTime;
                const { frequency, amplitude, colorShift } = shaderParams;
                
                if (shaderType === 'wave') {
                  // Wave effect
                  graphics.setStrokeStyle({ color: 0x00ff88, width: 2 });
                  graphics.moveTo(0, 250);
                  
                  for (let x = 0; x <= 800; x += 4) {
                    const y = 250 + Math.sin(x * frequency + time * shaderParams.speed) * amplitude;
                    graphics.lineTo(x, y);
                  }
                  graphics.stroke();
                  
                  // Color waves
                  for (let i = 0; i < 3; i++) {
                    const color = Math.floor(Math.sin(time + colorShift + i * 2) * 127 + 128) << (16 - i * 8);
                    graphics.setStrokeStyle({ color: color, width: 1 });
                    graphics.moveTo(0, 250 + i * 20);
                    
                    for (let x = 0; x <= 800; x += 4) {
                      const y = 250 + i * 20 + Math.sin(x * frequency + time * shaderParams.speed + i) * amplitude * 0.5;
                      graphics.lineTo(x, y);
                    }
                    graphics.stroke();
                  }
                } else if (shaderType === 'fractal') {
                  // Fractal-like pattern
                  const iterations = 50;
                  for (let i = 0; i < iterations; i++) {
                    const t = i / iterations;
                    const color = Math.floor(Math.sin(time + t * 10) * 127 + 128) << 16 | 
                                 Math.floor(Math.sin(time + t * 10 + 2) * 127 + 128) << 8 | 
                                 Math.floor(Math.sin(time + t * 10 + 4) * 127 + 128);
                    
                    graphics.setFillStyle({ color: color, alpha: 0.1 });
                    graphics.circle(400, 250, 100 * t);
                    graphics.fill();
                  }
                } else if (shaderType === 'plasma') {
                  // Plasma effect
                  for (let x = 0; x < 800; x += 10) {
                    for (let y = 0; y < 500; y += 10) {
                      const v = Math.sin(x * 0.01 + time) + 
                               Math.sin(y * 0.01 + time * 0.7) + 
                               Math.sin((x + y) * 0.01 + time * 0.5) + 
                               Math.sin(Math.sqrt(x * x + y * y) * 0.01 + time * 0.3);
                      
                      const color = Math.floor((Math.sin(v * 3.14159) + 1) * 127) << 16 | 
                                   Math.floor((Math.sin(v * 3.14159 + 2) + 1) * 127) << 8 | 
                                   Math.floor((Math.sin(v * 3.14159 + 4) + 1) * 127);
                      
                      graphics.setFillStyle({ color: color });
                      graphics.rect(x, y, 10, 10);
                      graphics.fill();
                    }
                  }
                } else if (shaderType === 'noise') {
                  // Noise effect
                  for (let x = 0; x < 800; x += 2) {
                    for (let y = 0; y < 500; y += 2) {
                      const noise = Math.random();
                      const color = Math.floor(noise * 255) << 16 | 
                                   Math.floor(noise * 255) << 8 | 
                                   Math.floor(noise * 255);
                      
                      graphics.setFillStyle({ color: color });
                      graphics.rect(x, y, 2, 2);
                      graphics.fill();
                    }
                  }
                }
              }}
            />
          </pixiContainer>
          
          {/* Control Panel */}
          <pixiGraphics draw={drawShaderControls} />
          
          {/* Shader Info */}
          <pixiGraphics draw={drawShaderInfo} />
          
          {/* Control Labels */}
          <pixiText
            text="Shader Controls"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={120}
            y={40}
            anchor={0.5}
          />
          
          <pixiText
            text="Use the controls above to adjust shader parameters in real-time"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 12,
              fill: 0xffffff,
              align: 'center',
              wordWrap: true,
              wordWrapWidth: 160,
            })}
            x={120}
            y={70}
            anchor={0.5}
          />
          
          {/* Info Labels */}
          <pixiText
            text="Shader Information"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={680}
            y={40}
            anchor={0.5}
          />
          
          <pixiText
            text={`Type: ${shaderType}\nTime: ${animationTime.toFixed(1)}s\nStatus: Active`}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 12,
              fill: 0xffffff,
              align: 'center',
            })}
            x={680}
            y={70}
            anchor={0.5}
          />
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Shader Types:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Wave Shader:</strong> Animated sine waves with customizable frequency, amplitude, and color shifting</li>
          <li><strong>Fractal Shader:</strong> Mandelbrot-like fractal patterns with distortion controls</li>
          <li><strong>Plasma Shader:</strong> Classic plasma effect with multiple sine wave combinations</li>
          <li><strong>Noise Shader:</strong> Procedural noise generation with animated patterns</li>
          <li><strong>Real-time Controls:</strong> Adjust shader parameters and see changes instantly</li>
        </ul>
      </div>
    </div>
  );
};

export default WebGLShaders;