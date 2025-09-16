import React, { useState, useEffect } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

// Extend the API to include only the components we need
extend({ Container, Graphics });

const ExtendAPIDemo = () => {
  const [bundleSize, setBundleSize] = useState('Calculating...');
  const [extendedComponents, setExtendedComponents] = useState(['Container', 'Graphics']);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Simulate bundle size calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      const baseSize = 150; // Base PixiJS size
      const componentSize = extendedComponents.length * 25; // Each component adds ~25kb
      const totalSize = baseSize + componentSize;
      setBundleSize(`${totalSize}kb`);
    }, 1000);
    return () => clearTimeout(timer);
  }, [extendedComponents]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const addComponent = (component) => {
    if (!extendedComponents.includes(component)) {
      setExtendedComponents(prev => [...prev, component]);
    }
  };

  const removeComponent = (component) => {
    setExtendedComponents(prev => prev.filter(c => c !== component));
  };

  const DemoContent = () => {
    return (
      <pixiContainer>
        {/* Background */}
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0x2c3e50 });
            graphics.rect(0, 0, 1000, 700);
            graphics.fill();
          }}
        />
        
        {/* Title */}
        <pixiText
          text="Extend API Demo"
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
        
        {/* Bundle Size Display */}
        <pixiContainer x={50} y={120}>
          <pixiText
            text="Bundle Size Optimization"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x34495e });
              graphics.rect(0, 0, 200, 80);
              graphics.fill();
            }}
            x={0}
            y={30}
          />
          
          <pixiText
            text={`Current Bundle Size:\n${bundleSize}`}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xffffff,
              align: 'center',
            })}
            x={100}
            y={70}
            anchor={0.5}
          />
          
          <pixiText
            text="Components Extended:"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xecf0f1,
              align: 'left',
            })}
            x={0}
            y={130}
            anchor={0}
          />
          
          {extendedComponents.map((component, index) => (
            <pixiText
              key={component}
              text={`• ${component}`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x2ecc71,
                align: 'left',
              })}
              x={0}
              y={150 + index * 20}
              anchor={0}
            />
          ))}
        </pixiContainer>
        
        {/* Extend API Example */}
        <pixiContainer x={300} y={120}>
          <pixiText
            text="Extend API Usage"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x34495e });
              graphics.rect(0, 0, 250, 120);
              graphics.fill();
            }}
            x={0}
            y={30}
          />
          
          <pixiText
            text="import { extend } from '@pixi/react';\nimport { Container, Graphics } from 'pixi.js';\n\nextend({ Container, Graphics });"
            style={new TextStyle({
              fontFamily: 'monospace',
              fontSize: 12,
              fill: 0xffffff,
              align: 'left',
            })}
            x={10}
            y={50}
            anchor={0}
          />
          
          <pixiText
            text="Now you can use:\n<pixiContainer />\n<pixiGraphics />"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0x2ecc71,
              align: 'left',
            })}
            x={0}
            y={170}
            anchor={0}
          />
        </pixiContainer>
        
        {/* Visual Demo */}
        <pixiContainer x={600} y={120}>
          <pixiText
            text="Visual Demo"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          {/* Animated container */}
          <pixiContainer x={0} y={30} rotation={animationFrame * 0.01}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xe74c3c });
                graphics.circle(0, 0, 30);
                graphics.fill();
              }}
            />
            
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x3498db });
                graphics.rect(-20, -20, 40, 40);
                graphics.fill();
              }}
              x={50}
              y={0}
            />
          </pixiContainer>
          
          <pixiText
            text="Extended Components\nin Action"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xffffff,
              align: 'center',
            })}
            x={0}
            y={120}
            anchor={0}
          />
        </pixiContainer>
        
        {/* Benefits */}
        <pixiContainer x={50} y={350}>
          <pixiText
            text="Benefits of Extend API"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiText
            text="• Smaller bundle sizes\n• Import only what you need\n• Better tree shaking\n• Faster load times\n• Reduced memory usage"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xecf0f1,
              align: 'left',
            })}
            x={0}
            y={30}
            anchor={0}
          />
        </pixiContainer>
        
        {/* Comparison */}
        <pixiContainer x={400} y={350}>
          <pixiText
            text="Before vs After"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0}
          />
          
          <pixiText
            text="Before (Import All):\n• Full PixiJS: ~500kb\n• All components loaded\n• Slower initialization"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0xe74c3c,
              align: 'left',
            })}
            x={0}
            y={30}
            anchor={0}
          />
          
          <pixiText
            text="After (Extend API):\n• Only needed components\n• Smaller bundle\n• Faster loading"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 14,
              fill: 0x2ecc71,
              align: 'left',
            })}
            x={0}
            y={120}
            anchor={0}
          />
        </pixiContainer>
        
        {/* Code Example */}
        <pixiContainer x={500} y={550}>
          <pixiText
            text="extend({ Container, Graphics, Text, Sprite })"
            style={new TextStyle({
              fontFamily: 'monospace',
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
        Extend API Demo
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Component Controls:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['Text', 'Sprite', 'AnimatedSprite', 'HTMLText'].map(component => (
            <button
              key={component}
              onClick={() => 
                extendedComponents.includes(component) 
                  ? removeComponent(component) 
                  : addComponent(component)
              }
              style={{
                padding: '8px 16px',
                backgroundColor: extendedComponents.includes(component) ? '#e74c3c' : '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {extendedComponents.includes(component) ? 'Remove' : 'Add'} {component}
            </button>
          ))}
        </div>
      </div>

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
          backgroundColor={0x2c3e50}
        >
          <DemoContent />
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Extend API Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Bundle Size Optimization:</strong> Import only the Pixi.js components you need</li>
          <li><strong>Tree Shaking:</strong> Unused code is automatically removed during build</li>
          <li><strong>Performance:</strong> Smaller bundles mean faster load times</li>
          <li><strong>Flexibility:</strong> Add components as your application grows</li>
        </ul>
        
        <h4 style={{ color: '#2c3e50', marginTop: '15px', marginBottom: '10px' }}>How It Works:</h4>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Internal Catalogue:</strong> @pixi/react maintains a catalogue of available components</li>
          <li><strong>Dynamic Registration:</strong> extend() adds components to this catalogue</li>
          <li><strong>JSX Components:</strong> Registered components become available with 'pixi' prefix</li>
          <li><strong>Type Safety:</strong> Works with TypeScript for full type checking</li>
        </ul>
      </div>
    </div>
  );
};

export default ExtendAPIDemo;
