import React, { useState, useRef, useCallback } from 'react';
import { Application, useApplication, useExtend, useTick, extend } from '@pixi/react';
import { Container, Graphics, Text, TextStyle, Sprite } from 'pixi.js';

// Extend basic components
extend({ Container, Graphics, Sprite });

// Component that uses useApplication hook
const UseApplicationDemo = () => {
  const { app } = useApplication();
  const [appInfo, setAppInfo] = useState('');

  const updateAppInfo = useCallback(() => {
    if (app) {
      setAppInfo(`App: ${app.screen.width}x${app.screen.height}, Renderer: ${app.renderer.type}`);
    }
  }, [app]);

  return (
    <pixiContainer>
      <pixiText
        text="useApplication Hook Demo"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0x00ff88,
          align: 'center',
        })}
        x={0}
        y={-30}
        anchor={0}
      />
      
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 0xe74c3c });
          graphics.circle(0, 0, 40);
          graphics.fill();
        }}
        x={0}
        y={0}
      />
      
      <pixiText
        text={appInfo || 'Click to get app info'}
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0xffffff,
          align: 'center',
        })}
        x={0}
        y={60}
        anchor={0}
      />
      
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 0x3498db });
          graphics.rect(0, 0, 100, 30);
          graphics.fill();
        }}
        x={0}
        y={90}
        interactive={true}
        pointerdown={updateAppInfo}
      />
      
      <pixiText
        text="Get App Info"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xffffff,
          align: 'center',
        })}
        x={50}
        y={105}
        anchor={0.5}
      />
    </pixiContainer>
  );
};

// Component that uses useExtend hook
const UseExtendDemo = () => {
  // Dynamically extend with additional components
  useExtend({ 
    Graphics: Graphics,
    Text: Text 
  });

  return (
    <pixiContainer>
      <pixiText
        text="useExtend Hook Demo"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0x00ff88,
          align: 'center',
        })}
        x={0}
        y={-30}
        anchor={0}
      />
      
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 0x2ecc71 });
          graphics.rect(0, 0, 80, 80);
          graphics.fill();
        }}
        x={0}
        y={0}
      />
      
      <pixiText
        text="Extended\nComponents"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xffffff,
          align: 'center',
        })}
        x={40}
        y={40}
        anchor={0.5}
      />
    </pixiContainer>
  );
};

// Component that uses useTick hook
const UseTickDemo = () => {
  const spriteRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);

  // Memoized callback to avoid re-adding to ticker every frame
  const animateRotation = useCallback(() => {
    if (spriteRef.current) {
      spriteRef.current.rotation += 0.02;
    }
  }, []);

  // Non-memoized callback (will cause issues)
  const badAnimateRotation = () => {
    setRotation(prev => prev + 0.02);
  };

  useTick({
    callback: animateRotation,
    context: spriteRef,
    isEnabled: isEnabled,
  });

  const toggleAnimation = () => {
    setIsEnabled(prev => !prev);
  };

  return (
    <pixiContainer>
      <pixiText
        text="useTick Hook Demo"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0x00ff88,
          align: 'center',
        })}
        x={0}
        y={-30}
        anchor={0}
      />
      
      {/* Animated sprite using ref */}
      <pixiGraphics
        ref={spriteRef}
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 0xf39c12 });
          graphics.moveTo(0, -30);
          graphics.lineTo(25, 20);
          graphics.lineTo(-25, 20);
          graphics.closePath();
          graphics.fill();
        }}
        x={0}
        y={0}
      />
      
      {/* Non-memoized animation (problematic) */}
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 0xe74c3c });
          graphics.circle(0, 0, 20);
          graphics.fill();
        }}
        x={100}
        y={0}
        rotation={rotation}
      />
      
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: isEnabled ? 0x2ecc71 : 0x95a5a6 });
          graphics.rect(0, 0, 80, 25);
          graphics.fill();
        }}
        x={0}
        y={50}
        interactive={true}
        pointerdown={toggleAnimation}
      />
      
      <pixiText
        text={isEnabled ? "Disable" : "Enable"}
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xffffff,
          align: 'center',
        })}
        x={40}
        y={62}
        anchor={0.5}
      />
      
      <pixiText
        text="Memoized (Good)"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0x2ecc71,
          align: 'center',
        })}
        x={0}
        y={85}
        anchor={0}
      />
      
      <pixiText
        text="Non-memoized (Bad)"
        style={new TextStyle({
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0xe74c3c,
          align: 'center',
        })}
        x={100}
        y={85}
        anchor={0}
      />
    </pixiContainer>
  );
};

// Main demo component
const HooksDemo = () => {
  const DemoContent = () => {
    return (
      <pixiContainer>
        {/* Background */}
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0x1a1a2e });
            graphics.rect(0, 0, 1000, 700);
            graphics.fill();
          }}
        />
        
        {/* Title */}
        <pixiText
          text="React PixiJS Hooks Demo"
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xffffff,
            align: 'center',
            fontWeight: 'bold',
          })}
          x={500}
          y={50}
          anchor={0.5}
        />
        
        {/* useApplication Demo */}
        <pixiContainer x={50} y={150}>
          <UseApplicationDemo />
        </pixiContainer>
        
        {/* useExtend Demo */}
        <pixiContainer x={300} y={150}>
          <UseExtendDemo />
        </pixiContainer>
        
        {/* useTick Demo */}
        <pixiContainer x={550} y={150}>
          <UseTickDemo />
        </pixiContainer>
        
        {/* Hook Descriptions */}
        <pixiContainer x={50} y={350}>
          <pixiText
            text="useApplication"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiText
            text="• Access parent PIXI.Application\n• Only works in child components\n• Uses React Context\n• Must be inside <Application>"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xecf0f1,
              align: 'left',
            })}
            x={0}
            y={30}
            anchor={0}
          />
        </pixiContainer>
        
        <pixiContainer x={300} y={350}>
          <pixiText
            text="useExtend"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiText
            text="• Extend API as React hook\n• Memoized (unlike extend function)\n• Dynamic component registration\n• Better performance"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xecf0f1,
              align: 'left',
            })}
            x={0}
            y={30}
            anchor={0}
          />
        </pixiContainer>
        
        <pixiContainer x={550} y={350}>
          <pixiText
            text="useTick"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiText
            text="• Attach callback to Ticker\n• Control all ticker.add options\n• isEnabled for pause/resume\n• Memoize callbacks!"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xecf0f1,
              align: 'left',
            })}
            x={0}
            y={30}
            anchor={0}
          />
        </pixiContainer>
        
        {/* Warning */}
        <pixiContainer x={500} y={550}>
          <pixiText
            text="⚠️ WARNING: Always memoize useTick callbacks to avoid performance issues!"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xf39c12,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0.5}
          />
        </pixiContainer>
      </pixiContainer>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        React PixiJS Hooks Demo
      </h2>

      <div style={{ 
        width: '1000px', 
        height: '700px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application
          width={1000}
          height={700}
          backgroundColor={0x1a1a2e}
        >
          <DemoContent />
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Hooks Demonstrated:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>useApplication:</strong> Access the parent PIXI.Application instance</li>
          <li><strong>useExtend:</strong> Memoized version of the extend API</li>
          <li><strong>useTick:</strong> Attach callbacks to the application ticker</li>
        </ul>
        
        <h4 style={{ color: '#2c3e50', marginTop: '15px', marginBottom: '10px' }}>Important Notes:</h4>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>useApplication:</strong> Only works in child components, not in the same component that creates Application</li>
          <li><strong>useTick:</strong> Always memoize callbacks with useCallback to avoid performance issues</li>
          <li><strong>useExtend:</strong> Better performance than the extend function due to memoization</li>
        </ul>
      </div>
    </div>
  );
};

export default HooksDemo;
