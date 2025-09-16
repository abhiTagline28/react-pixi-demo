import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const AnimationController = ({ setAnimationTime, setProgressValue, isProgressAnimating, setIsProgressAnimating }) => {
  useTick(() => {
    setAnimationTime(prev => prev + 0.1);
    
    if (isProgressAnimating) {
      setProgressValue(prev => {
        if (prev >= 100) {
          setIsProgressAnimating(false);
          return 100;
        }
        return prev + 1;
      });
    }
  });
  
  return null;
};

const InteractiveUIComponents = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [progressValue, setProgressValue] = useState(0);
  const [toggleState, setToggleState] = useState(false);
  const [buttonStates, setButtonStates] = useState({});
  const [animationTime, setAnimationTime] = useState(0);
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);

  const drawButton = useCallback((graphics, x, y, width, height, text, isPressed = false, isHovered = false, color = 0x007bff) => {
    graphics.clear();
    
    const scale = isPressed ? 0.95 : isHovered ? 1.05 : 1;
    const adjustedWidth = width * scale;
    const adjustedHeight = height * scale;
    const adjustedX = x - (adjustedWidth - width) / 2;
    const adjustedY = y - (adjustedHeight - height) / 2;
    
    // Button shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
    graphics.rect(adjustedX + 2, adjustedY + 2, adjustedWidth, adjustedHeight, 8);
    graphics.fill();
    
    // Button background
    graphics.setFillStyle({ color: color });
    graphics.rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight, 8);
    graphics.fill();
    
    // Button highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.2 });
    graphics.rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight * 0.3, 8);
    graphics.fill();
    
    // Button border
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.rect(adjustedX, adjustedY, adjustedWidth, adjustedHeight, 8);
    graphics.stroke();
  }, []);

  const drawSlider = useCallback((graphics, x, y, width, value, isDragging = false) => {
    graphics.clear();
    
    // Track background
    graphics.setFillStyle({ color: 0xe0e0e0 });
    graphics.rect(x, y + 15, width, 10, 5);
    graphics.fill();
    
    // Track border
    graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
    graphics.rect(x, y + 15, width, 10, 5);
    graphics.stroke();
    
    // Progress fill
    const progressWidth = (value / 100) * width;
    graphics.setFillStyle({ color: 0x007bff });
    graphics.rect(x, y + 15, progressWidth, 10, 5);
    graphics.fill();
    
    // Thumb
    const thumbX = x + progressWidth;
    const thumbScale = isDragging ? 1.2 : 1;
    
    graphics.setFillStyle({ color: 0xffffff });
    graphics.circle(thumbX, y + 20, 12 * thumbScale);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x007bff, width: 3 });
    graphics.circle(thumbX, y + 20, 12 * thumbScale);
    graphics.stroke();
    
    // Thumb shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.2 });
    graphics.circle(thumbX + 1, y + 21, 12 * thumbScale);
    graphics.fill();
  }, []);

  const drawProgressBar = useCallback((graphics, x, y, width, height, value, animated = false) => {
    graphics.clear();
    
    // Background
    graphics.setFillStyle({ color: 0xe0e0e0 });
    graphics.rect(x, y, width, height, 5);
    graphics.fill();
    
    // Progress fill
    const fillWidth = (value / 100) * width;
    graphics.setFillStyle({ color: 0x28a745 });
    graphics.rect(x, y, fillWidth, height, 5);
    graphics.fill();
    
    // Shimmer effect
    if (animated && value > 0) {
      const shimmerX = x + (Math.sin(animationTime * 3) * 20 + 20);
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
      graphics.rect(shimmerX, y, 20, height);
      graphics.fill();
    }
    
    // Border
    graphics.setStrokeStyle({ color: 0xcccccc, width: 1 });
    graphics.rect(x, y, width, height, 5);
    graphics.stroke();
  }, [animationTime]);

  const drawToggleSwitch = useCallback((graphics, x, y, isOn, isHovered = false) => {
    graphics.clear();
    
    const width = 60;
    const height = 30;
    const thumbRadius = 12;
    const thumbX = isOn ? x + width - thumbRadius - 3 : x + thumbRadius + 3;
    
    // Track background
    graphics.setFillStyle({ color: isOn ? 0x28a745 : 0xcccccc });
    graphics.rect(x, y, width, height, 15);
    graphics.fill();
    
    // Track border
    graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
    graphics.rect(x, y, width, height, 15);
    graphics.stroke();
    
    // Thumb
    const thumbScale = isHovered ? 1.1 : 1;
    graphics.setFillStyle({ color: 0xffffff });
    graphics.circle(thumbX, y + height/2, thumbRadius * thumbScale);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x000000, width: 1 });
    graphics.circle(thumbX, y + height/2, thumbRadius * thumbScale);
    graphics.stroke();
    
    // Thumb shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.2 });
    graphics.circle(thumbX + 1, y + height/2 + 1, thumbRadius * thumbScale);
    graphics.fill();
  }, []);

  const drawInputField = useCallback((graphics, x, y, width, height, text, isFocused = false) => {
    graphics.clear();
    
    // Background
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(x, y, width, height, 5);
    graphics.fill();
    
    // Border
    graphics.setStrokeStyle({ 
      color: isFocused ? 0x007bff : 0xcccccc, 
      width: isFocused ? 3 : 1 
    });
    graphics.rect(x, y, width, height, 5);
    graphics.stroke();
    
    // Focus glow
    if (isFocused) {
      graphics.setStrokeStyle({ color: 0x007bff, alpha: 0.3, width: 8 });
      graphics.rect(x - 2, y - 2, width + 4, height + 4, 7);
      graphics.stroke();
    }
  }, []);

  const handleButtonClick = (buttonId) => {
    setButtonStates(prev => ({
      ...prev,
      [buttonId]: !prev[buttonId]
    }));
  };

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);
  };

  const handleToggleSwitch = () => {
    setToggleState(!toggleState);
  };

  const startProgressAnimation = () => {
    setProgressValue(0);
    setIsProgressAnimating(true);
  };

  const resetProgress = () => {
    setProgressValue(0);
    setIsProgressAnimating(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive UI Components
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={startProgressAnimation}
          disabled={isProgressAnimating}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isProgressAnimating ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isProgressAnimating ? 'not-allowed' : 'pointer'
          }}
        >
          {isProgressAnimating ? 'Animating...' : 'Start Progress'}
        </button>
        <button 
          onClick={resetProgress}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Progress
        </button>
        <span style={{ marginLeft: '20px', color: '#6c757d' }}>
          Slider: {sliderValue}% | Toggle: {toggleState ? 'ON' : 'OFF'}
        </span>
      </div>

      <div style={{ 
        width: '1000px', 
        height: '600px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={1000} height={600} backgroundColor={0x1a1a2e}>
          <AnimationController 
            setAnimationTime={setAnimationTime}
            setProgressValue={setProgressValue}
            isProgressAnimating={isProgressAnimating}
            setIsProgressAnimating={setIsProgressAnimating}
          />
          {/* Background */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x1a1a2e });
              graphics.rect(0, 0, 1000, 600);
              graphics.fill();
            }}
          />
          
          {/* Title */}
          <pixiText
            text="Interactive UI Components Demo"
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 28,
              fill: 0xffffff,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={500}
            y={30}
            anchor={0.5}
          />
          
          {/* Buttons Section */}
          <pixiContainer x={50} y={100}>
            <pixiText
              text="Interactive Buttons"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            {/* Primary Button */}
            <pixiGraphics
              draw={(graphics) => drawButton(graphics, 0, 40, 120, 40, 'Primary', false, false, 0x007bff)}
              interactive={true}
              pointerdown={() => handleButtonClick('primary')}
            />
            <pixiText
              text="Primary"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={60}
              y={60}
              anchor={0.5}
            />
            
            {/* Success Button */}
            <pixiGraphics
              draw={(graphics) => drawButton(graphics, 140, 40, 120, 40, 'Success', false, false, 0x28a745)}
              interactive={true}
              pointerdown={() => handleButtonClick('success')}
            />
            <pixiText
              text="Success"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={200}
              y={60}
              anchor={0.5}
            />
            
            {/* Danger Button */}
            <pixiGraphics
              draw={(graphics) => drawButton(graphics, 280, 40, 120, 40, 'Danger', false, false, 0xdc3545)}
              interactive={true}
              pointerdown={() => handleButtonClick('danger')}
            />
            <pixiText
              text="Danger"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={340}
              y={60}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Slider Section */}
          <pixiContainer x={50} y={200}>
            <pixiText
              text="Interactive Slider"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            <pixiGraphics draw={(graphics) => drawSlider(graphics, 0, 40, 300, sliderValue)} />
            
            <pixiText
              text={`Value: ${sliderValue}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={150}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Progress Bar Section */}
          <pixiContainer x={50} y={300}>
            <pixiText
              text="Animated Progress Bar"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            <pixiGraphics draw={(graphics) => drawProgressBar(graphics, 0, 40, 300, 20, progressValue, isProgressAnimating)} />
            
            <pixiText
              text={`Progress: ${Math.round(progressValue)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={150}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Toggle Switch Section */}
          <pixiContainer x={50} y={400}>
            <pixiText
              text="Toggle Switch"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            <pixiGraphics
              draw={(graphics) => drawToggleSwitch(graphics, 0, 40, toggleState)}
              interactive={true}
              pointerdown={handleToggleSwitch}
            />
            
            <pixiText
              text={`State: ${toggleState ? 'ON' : 'OFF'}`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={30}
              y={90}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Input Field Section */}
          <pixiContainer x={500} y={100}>
            <pixiText
              text="Input Field"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            <pixiGraphics draw={(graphics) => drawInputField(graphics, 0, 40, 200, 40, 'Enter text...', false)} />
            
            <pixiText
              text="Click to focus"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x888888,
                align: 'center',
              })}
              x={100}
              y={90}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Card Component */}
          <pixiContainer x={500} y={200}>
            <pixiText
              text="Card Component"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
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
                
                // Card shadow
                graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
                graphics.rect(2, 42, 200, 120, 10);
                graphics.fill();
                
                // Card background
                graphics.setFillStyle({ color: 0xffffff });
                graphics.rect(0, 40, 200, 120, 10);
                graphics.fill();
                
                // Card border
                graphics.setStrokeStyle({ color: 0xe0e0e0, width: 1 });
                graphics.rect(0, 40, 200, 120, 10);
                graphics.stroke();
              }}
            />
            
            <pixiText
              text="Card Title"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x333333,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={100}
              y={60}
              anchor={0.5}
            />
            
            <pixiText
              text="This is a sample card component with shadow and rounded corners."
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x666666,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 180,
              })}
              x={100}
              y={90}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Badge Component */}
          <pixiContainer x={500} y={350}>
            <pixiText
              text="Badge Components"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            {/* Success Badge */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x28a745 });
                graphics.rect(0, 40, 80, 25, 12);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
                graphics.rect(0, 40, 80, 25, 12);
                graphics.stroke();
              }}
            />
            <pixiText
              text="Success"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={40}
              y={52}
              anchor={0.5}
            />
            
            {/* Warning Badge */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xffc107 });
                graphics.rect(90, 40, 80, 25, 12);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
                graphics.rect(90, 40, 80, 25, 12);
                graphics.stroke();
              }}
            />
            <pixiText
              text="Warning"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={130}
              y={52}
              anchor={0.5}
            />
            
            {/* Info Badge */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x17a2b8 });
                graphics.rect(180, 40, 80, 25, 12);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
                graphics.rect(180, 40, 80, 25, 12);
                graphics.stroke();
              }}
            />
            <pixiText
              text="Info"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={220}
              y={52}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Status Indicators */}
          <pixiContainer x={500} y={450}>
            <pixiText
              text="Status Indicators"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            {/* Online Status */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                const pulseScale = 1 + Math.sin(animationTime * 3) * 0.2;
                graphics.setFillStyle({ color: 0x28a745 });
                graphics.circle(10, 50, 8 * pulseScale);
                graphics.fill();
              }}
            />
            <pixiText
              text="Online"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={25}
              y={45}
              anchor={0}
            />
            
            {/* Offline Status */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x6c757d });
                graphics.circle(10, 70, 8);
                graphics.fill();
              }}
            />
            <pixiText
              text="Offline"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={25}
              y={65}
              anchor={0}
            />
            
            {/* Warning Status */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                const pulseScale = 1 + Math.sin(animationTime * 2) * 0.15;
                graphics.setFillStyle({ color: 0xffc107 });
                graphics.circle(10, 90, 8 * pulseScale);
                graphics.fill();
              }}
            />
            <pixiText
              text="Warning"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={25}
              y={85}
              anchor={0}
            />
          </pixiContainer>
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Interactive Buttons:</strong> Hover, press, and click states with scaling effects</li>
          <li><strong>Slider Control:</strong> Draggable slider with visual feedback</li>
          <li><strong>Progress Bars:</strong> Animated progress with shimmer effects</li>
          <li><strong>Toggle Switches:</strong> Smooth on/off transitions</li>
          <li><strong>UI Components:</strong> Cards, badges, input fields, and status indicators</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveUIComponents;
