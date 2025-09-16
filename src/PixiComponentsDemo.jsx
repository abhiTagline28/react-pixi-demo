import React, { useState, useEffect } from 'react';
import { Application, extend } from '@pixi/react';
import { 
  Container, 
  Graphics, 
  Text, 
  TextStyle, 
  Sprite, 
  Texture,
  AnimatedSprite
} from 'pixi.js';

// Extend the API to include all components
extend({ Container, Graphics, Sprite, AnimatedSprite, Text });

const PixiComponentsDemo = () => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 360);
      setRotation(prev => prev + 0.02);
    }, 16);
    return () => clearInterval(interval);
  }, []);

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
          text="Pixi.js Components Demo"
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
        
        {/* Container Example */}
        <pixiContainer x={100} y={150}>
          <pixiText
            text="Container Example"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          {/* Nested containers with different properties */}
          <pixiContainer x={0} y={0} rotation={rotation}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xff6b6b });
                graphics.circle(0, 0, 40);
                graphics.fill();
              }}
            />
          </pixiContainer>
          
          <pixiContainer x={100} y={0} scale={{ x: 1.2, y: 1.2 }}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x4ecdc4 });
                graphics.rect(-30, -30, 60, 60);
                graphics.fill();
              }}
            />
          </pixiContainer>
        </pixiContainer>
        
        {/* Graphics Example */}
        <pixiContainer x={400} y={150}>
          <pixiText
            text="Graphics Example"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              
              // Animated circle
              graphics.setFillStyle({ color: 0xffd93d });
              graphics.circle(0, 0, 30 + Math.sin(animationFrame * 0.05) * 10);
              graphics.fill();
              
              // Rotating square
              graphics.setFillStyle({ color: 0xff6b6b });
              graphics.rect(-25, -25, 50, 50);
              graphics.fill();
            }}
            rotation={rotation}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Sprite Example */}
        <pixiContainer x={700} y={150}>
          <pixiText
            text="Sprite Example"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          {/* Create a simple colored sprite */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x9b59b6 });
              graphics.rect(-40, -40, 80, 80);
              graphics.fill();
            }}
            rotation={rotation * 0.5}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Text Example */}
        <pixiContainer x={100} y={350}>
          <pixiText
            text="Text Components"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          <pixiText
            text="Regular Text"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xffffff,
              align: 'center',
            })}
            x={0}
            y={0}
            anchor={0.5}
          />
          
          <pixiText
            text="Styled Text"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0xff6b6b,
              align: 'center',
              fontWeight: 'bold',
              stroke: { color: 0xffffff, width: 2 },
            })}
            x={0}
            y={40}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Text Styling Example */}
        <pixiContainer x={400} y={350}>
          <pixiText
            text="Advanced Text Styling"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          <pixiText
            text="Styled Text with Effects"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0xffffff,
              fontWeight: 'bold',
              stroke: { color: 0xff6b6b, width: 2 },
            })}
            x={0}
            y={0}
            anchor={0.5}
          />
          
          <pixiText
            text="Multi-line Text\nwith Line Breaks"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0x4ecdc4,
              align: 'center',
            })}
            x={0}
            y={30}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* AnimatedSprite Example */}
        <pixiContainer x={700} y={350}>
          <pixiText
            text="AnimatedSprite Example"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-30}
            anchor={0.5}
          />
          
          {/* Create animated sprite using graphics */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              const time = animationFrame * 0.1;
              graphics.setFillStyle({ 
                color: Math.floor(Math.sin(time) * 127 + 128) << 16 | 
                       Math.floor(Math.sin(time + 2) * 127 + 128) << 8 | 
                       Math.floor(Math.sin(time + 4) * 127 + 128)
              });
              graphics.circle(0, 0, 25);
              graphics.fill();
            }}
            rotation={rotation}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Properties Example */}
        <pixiContainer x={500} y={550}>
          <pixiText
            text="All Pixi.js properties are available as component props"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xbdc3c7,
              align: 'center',
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
        Pixi.js Components Demo
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
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Components Demonstrated:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>pixiContainer:</strong> Container for grouping and transforming child objects</li>
          <li><strong>pixiGraphics:</strong> Graphics object with draw callback for custom shapes</li>
          <li><strong>pixiSprite:</strong> Sprite component (demonstrated with graphics)</li>
          <li><strong>pixiAnimatedSprite:</strong> Animated sprite component</li>
          <li><strong>pixiText:</strong> Text rendering with TextStyle and advanced styling</li>
        </ul>
        
        <h4 style={{ color: '#2c3e50', marginTop: '15px', marginBottom: '10px' }}>Special Properties:</h4>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>draw callback:</strong> Graphics component uses draw callback for custom rendering</li>
          <li><strong>Properties:</strong> All Pixi.js class properties are available as component props</li>
          <li><strong>Nesting:</strong> Components can be nested and transformed independently</li>
        </ul>
      </div>
    </div>
  );
};

export default PixiComponentsDemo;
