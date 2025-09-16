import React, { useRef, useState } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

// Extend the API to include Container and Graphics
extend({ Container, Graphics });

const ApplicationDemo = () => {
  const parentRef = useRef(null);
  const [resizeMode, setResizeMode] = useState('window');

  const DemoContent = () => {
    return (
      <pixiContainer>
        {/* Background */}
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0x2c3e50 });
            graphics.rect(0, 0, 800, 600);
            graphics.fill();
          }}
        />
        
        {/* Title */}
        <pixiText
          text="Application Component Demo"
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffffff,
            align: 'center',
          })}
          x={400}
          y={50}
          anchor={0.5}
        />
        
        {/* Subtitle */}
        <pixiText
          text="Demonstrating extensions and resizeTo functionality"
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xecf0f1,
            align: 'center',
          })}
          x={400}
          y={100}
          anchor={0.5}
        />
        
        {/* Animated shapes */}
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0xe74c3c });
            graphics.circle(200, 200, 30);
            graphics.fill();
          }}
        />
        
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0x3498db });
            graphics.rect(500, 150, 100, 100);
            graphics.fill();
          }}
        />
        
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 0x2ecc71 });
            graphics.moveTo(600, 300);
            graphics.lineTo(650, 250);
            graphics.lineTo(700, 300);
            graphics.lineTo(650, 350);
            graphics.closePath();
            graphics.fill();
          }}
        />
        
        {/* Info text */}
        <pixiText
          text="This Application uses extensions for Container and Graphics"
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xbdc3c7,
            align: 'center',
          })}
          x={400}
          y={450}
          anchor={0.5}
        />
        
        <pixiText
          text="resizeTo property allows automatic resizing to parent element"
          style={new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xbdc3c7,
            align: 'center',
          })}
          x={400}
          y={480}
          anchor={0.5}
        />
      </pixiContainer>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Application Component Demo
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Resize Mode:</label>
        <select 
          value={resizeMode} 
          onChange={(e) => setResizeMode(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="window">Window</option>
          <option value="parent">Parent Element</option>
        </select>
      </div>

      <div 
        ref={parentRef}
        style={{ 
          width: '800px', 
          height: '600px', 
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <Application
          width={800}
          height={600}
          backgroundColor={0x2c3e50}
          resizeTo={resizeMode === 'parent' ? parentRef : window}
          extensions={[]}
        >
          <DemoContent />
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features Demonstrated:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Extensions:</strong> The Application can load extensions (currently empty for demo)</li>
          <li><strong>resizeTo:</strong> Automatically resizes the canvas to match the parent element or window</li>
          <li><strong>extend API:</strong> Container and Graphics components are extended for use</li>
          <li><strong>Graphics Drawing:</strong> Dynamic shapes drawn using the draw callback</li>
          <li><strong>Text Rendering:</strong> Multiple text elements with different styles</li>
        </ul>
      </div>
    </div>
  );
};

export default ApplicationDemo;
