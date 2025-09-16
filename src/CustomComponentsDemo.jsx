import React, { useState, useRef, useEffect } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

// Custom Viewport-like component
class CustomViewport extends Container {
  constructor() {
    super();
    this.interactive = true;
    this.dragging = false;
    this.dragData = null;
    this.scaleFactor = 1;
    this.minScale = 0.5;
    this.maxScale = 3;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.on('pointerdown', this.onDragStart.bind(this));
    this.on('pointermove', this.onDragMove.bind(this));
    this.on('pointerup', this.onDragEnd.bind(this));
    this.on('pointerupoutside', this.onDragEnd.bind(this));
    this.on('wheel', this.onWheel.bind(this));
  }
  
  onDragStart(event) {
    this.dragging = true;
    this.dragData = event.data;
  }
  
  onDragMove(event) {
    if (this.dragging && this.dragData) {
      const newPosition = this.dragData.getLocalPosition(this.parent);
      this.x = newPosition.x - this.dragData.getLocalPosition(this).x;
      this.y = newPosition.y - this.dragData.getLocalPosition(this).y;
    }
  }
  
  onDragEnd() {
    this.dragging = false;
    this.dragData = null;
  }
  
  onWheel(event) {
    const delta = event.data.originalEvent.deltaY;
    const scaleChange = delta > 0 ? 0.9 : 1.1;
    const newScale = this.scale.x * scaleChange;
    
    if (newScale >= this.minScale && newScale <= this.maxScale) {
      this.scale.set(newScale);
    }
  }
}

// Custom Particle System
class ParticleSystem extends Container {
  constructor() {
    super();
    this.particles = [];
    this.maxParticles = 50;
    this.createParticles();
  }
  
  createParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = new Graphics();
      particle.beginFill(Math.random() * 0xffffff);
      particle.drawCircle(0, 0, Math.random() * 3 + 1);
      particle.endFill();
      
      particle.x = Math.random() * 400;
      particle.y = Math.random() * 300;
      particle.vx = (Math.random() - 0.5) * 2;
      particle.vy = (Math.random() - 0.5) * 2;
      particle.life = 1;
      particle.maxLife = Math.random() * 100 + 50;
      
      this.particles.push(particle);
      this.addChild(particle);
    }
  }
  
  update() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      
      if (particle.life <= 0) {
        particle.x = Math.random() * 400;
        particle.y = Math.random() * 300;
        particle.life = particle.maxLife;
      }
      
      particle.alpha = particle.life / particle.maxLife;
    });
  }
}

// Custom Button Component
class CustomButton extends Container {
  constructor(text, onClick) {
    super();
    this.text = text;
    this.onClick = onClick;
    this.interactive = true;
    this.buttonMode = true;
    this.isPressed = false;
    
    this.createButton();
    this.setupEventListeners();
  }
  
  createButton() {
    // Button background
    this.background = new Graphics();
    this.background.beginFill(0x3498db);
    this.background.drawRoundedRect(0, 0, 120, 40, 8);
    this.background.endFill();
    this.addChild(this.background);
    
    // Button text
    this.buttonText = new Text(this.text, new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      align: 'center',
    }));
    this.buttonText.anchor.set(0.5);
    this.buttonText.x = 60;
    this.buttonText.y = 20;
    this.addChild(this.buttonText);
  }
  
  setupEventListeners() {
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));
    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
  }
  
  onPointerDown() {
    this.isPressed = true;
    this.scale.set(0.95);
  }
  
  onPointerUp() {
    if (this.isPressed) {
      this.isPressed = false;
      this.scale.set(1);
      if (this.onClick) {
        this.onClick();
      }
    }
  }
  
  onPointerOver() {
    if (!this.isPressed) {
      this.scale.set(1.05);
    }
  }
  
  onPointerOut() {
    if (!this.isPressed) {
      this.scale.set(1);
    }
  }
}

// Extend the API with custom components
extend({ CustomViewport, ParticleSystem });

// React wrapper for CustomButton
const CustomButtonWrapper = ({ text, onClick, x = 0, y = 0 }) => {
  const buttonRef = useRef(null);
  
  useEffect(() => {
    if (buttonRef.current) {
      const button = new CustomButton(text, onClick);
      button.x = x;
      button.y = y;
      buttonRef.current.addChild(button);
      
      return () => {
        if (buttonRef.current && button.parent) {
          button.parent.removeChild(button);
        }
      };
    }
  }, [text, onClick, x, y]);
  
  return <pixiContainer ref={buttonRef} />;
};

// React wrapper for ParticleSystem with animation
const ParticleSystemWrapper = ({ x = 0, y = 0 }) => {
  const particleRef = useRef(null);
  
  useEffect(() => {
    if (particleRef.current) {
      const particleSystem = new ParticleSystem();
      particleSystem.x = x;
      particleSystem.y = y;
      particleRef.current.addChild(particleSystem);
      
      // Animation loop
      const animate = () => {
        particleSystem.update();
        requestAnimationFrame(animate);
      };
      animate();
      
      return () => {
        if (particleRef.current && particleSystem.parent) {
          particleSystem.parent.removeChild(particleSystem);
        }
      };
    }
  }, [x, y]);
  
  return <pixiContainer ref={particleRef} />;
};

const CustomComponentsDemo = () => {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [showParticles, setShowParticles] = useState(true);

  const handleButtonClick = () => {
    setButtonClicks(prev => prev + 1);
  };

  const toggleParticles = () => {
    setShowParticles(prev => !prev);
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
          text="Custom Components Demo"
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
        
        {/* Custom Viewport */}
        <pixiContainer x={50} y={120}>
          <pixiText
            text="Custom Viewport (Draggable & Zoomable)"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-20}
            anchor={0}
          />
          
          <pixiCustomViewport x={0} y={0}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xe74c3c });
                graphics.rect(0, 0, 200, 150);
                graphics.fill();
                graphics.setFillStyle({ color: 0xffffff });
                graphics.rect(20, 20, 160, 110);
                graphics.fill();
              }}
            />
            
            <pixiText
              text="Drag me around!\nScroll to zoom"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x2c3e50,
                align: 'center',
              })}
              x={100}
              y={75}
              anchor={0.5}
            />
          </pixiCustomViewport>
        </pixiContainer>
        
        {/* Custom Button */}
        <pixiContainer x={300} y={120}>
          <pixiText
            text="Custom Button Component"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-20}
            anchor={0}
          />
          
          <CustomButtonWrapper 
            text="Click Me!" 
            onClick={handleButtonClick}
            x={0}
            y={0}
          />
          
          <pixiText
            text={`Clicks: ${buttonClicks}`}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xffffff,
              align: 'center',
            })}
            x={60}
            y={60}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Particle System */}
        <pixiContainer x={500} y={120}>
          <pixiText
            text="Custom Particle System"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 18,
              fill: 0x00ff88,
              align: 'center',
            })}
            x={0}
            y={-20}
            anchor={0}
          />
          
          {showParticles && (
            <ParticleSystemWrapper x={0} y={0} />
          )}
          
          <CustomButtonWrapper 
            text={showParticles ? "Hide" : "Show"}
            onClick={toggleParticles}
            x={0}
            y={200}
          />
        </pixiContainer>
        
        {/* Instructions */}
        <pixiContainer x={500} y={400}>
          <pixiText
            text="Custom Components Features:"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 20,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={0}
            y={0}
            anchor={0.5}
          />
          
          <pixiText
            text="• Extend API allows custom Pixi.js classes\n• Full access to Pixi.js functionality\n• Interactive components with event handling\n• Reusable across your application"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 16,
              fill: 0xecf0f1,
              align: 'center',
            })}
            x={0}
            y={40}
            anchor={0.5}
          />
        </pixiContainer>
        
        {/* Code Example */}
        <pixiContainer x={500} y={550}>
          <pixiText
            text="extend({ CustomViewport, ParticleSystem, CustomButton })"
            style={new TextStyle({
              fontFamily: 'monospace',
              fontSize: 14,
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
        Custom Components Demo
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
          backgroundColor={0x2c3e50}
        >
          <DemoContent />
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Custom Components Demonstrated:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>CustomViewport:</strong> Draggable and zoomable container with mouse/touch interaction</li>
          <li><strong>ParticleSystem:</strong> Animated particle system with lifecycle management</li>
          <li><strong>CustomButton:</strong> Interactive button with hover, press, and click states</li>
        </ul>
        
        <h4 style={{ color: '#2c3e50', marginTop: '15px', marginBottom: '10px' }}>Key Features:</h4>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>extend API:</strong> Register custom Pixi.js classes as React components</li>
          <li><strong>Event Handling:</strong> Full access to Pixi.js interaction events</li>
          <li><strong>Reusability:</strong> Custom components can be used throughout your app</li>
          <li><strong>TypeScript Support:</strong> Custom components work with TypeScript (see docs)</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomComponentsDemo;
