import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const AnimationController = ({ setAnimationProgress }) => {
  useTick(() => {
    setAnimationProgress(prev => Math.min(prev + 0.02, 1));
  });
  
  return null;
};

const InteractiveDataVisualization = () => {
  const [data, setData] = useState([
    { label: 'Q1', value: 85, color: 0xff6b6b },
    { label: 'Q2', value: 92, color: 0x4ecdc4 },
    { label: 'Q3', value: 78, color: 0x45b7d1 },
    { label: 'Q4', value: 96, color: 0xf9ca24 },
  ]);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [animationProgress, setAnimationProgress] = useState(0);

  const drawBarChart = useCallback((graphics) => {
    graphics.clear();
    
    const barWidth = 80;
    const maxHeight = 200;
    const startX = 100;
    const startY = 300;
    
    data.forEach((item, index) => {
      const x = startX + index * (barWidth + 20);
      const height = (item.value / 100) * maxHeight * animationProgress;
      const y = startY - height;
      
      // Bar shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.2 });
      graphics.rect(x + 3, y + 3, barWidth, height);
      graphics.fill();
      
      // Bar
      graphics.setFillStyle({ color: item.color });
      graphics.rect(x, y, barWidth, height);
      graphics.fill();
      
      // Bar highlight
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.3 });
      graphics.rect(x, y, barWidth * 0.2, height);
      graphics.fill();
      
      // Interactive hover effect
      if (hoveredIndex === index) {
        graphics.setStrokeStyle({ color: 0xffffff, width: 3 });
        graphics.rect(x - 2, y - 2, barWidth + 4, height + 4);
        graphics.stroke();
      }
    });
  }, [data, animationProgress, hoveredIndex]);

  const drawPieChart = useCallback((graphics) => {
    graphics.clear();
    
    const centerX = 500;
    const centerY = 200;
    const radius = 80;
    
    let currentAngle = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * animationProgress;
      
      graphics.setFillStyle({ color: item.color });
      graphics.moveTo(centerX, centerY);
      graphics.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      graphics.lineTo(centerX, centerY);
      graphics.fill();
      
      // Slice border
      graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
      graphics.moveTo(centerX, centerY);
      graphics.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      graphics.lineTo(centerX, centerY);
      graphics.stroke();
      
      currentAngle += sliceAngle;
    });
  }, [data, animationProgress]);

  const drawLineChart = useCallback((graphics) => {
    graphics.clear();
    
    const startX = 100;
    const startY = 150;
    const width = 300;
    const height = 100;
    
    // Grid lines
    graphics.setStrokeStyle({ color: 0x333333, width: 1 });
    for (let i = 0; i <= 4; i++) {
      const y = startY + (height / 4) * i;
      graphics.moveTo(startX, y);
      graphics.lineTo(startX + width, y);
    }
    
    // Line chart
    graphics.setStrokeStyle({ color: 0x4ecdc4, width: 3 });
    graphics.moveTo(startX, startY + height - (data[0].value / 100) * height);
    
    for (let i = 1; i < data.length; i++) {
      const x = startX + (width / (data.length - 1)) * i;
      const y = startY + height - (data[i].value / 100) * height;
      graphics.lineTo(x, y);
    }
    graphics.stroke();
    
    // Data points
    data.forEach((item, index) => {
      const x = startX + (width / (data.length - 1)) * index;
      const y = startY + height - (item.value / 100) * height;
      
      graphics.setFillStyle({ color: item.color });
      graphics.circle(x, y, 6);
      graphics.fill();
      
      graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
      graphics.circle(x, y, 6);
      graphics.stroke();
    });
  }, [data]);

  const handleBarClick = (index) => {
    setHoveredIndex(hoveredIndex === index ? -1 : index);
  };

  const addDataPoint = () => {
    const newValue = Math.floor(Math.random() * 100);
    const newColor = Math.floor(Math.random() * 0xffffff);
    setData(prev => [...prev, { 
      label: `Q${prev.length + 1}`, 
      value: newValue, 
      color: newColor 
    }]);
  };

  const resetData = () => {
    setData([
      { label: 'Q1', value: 85, color: 0xff6b6b },
      { label: 'Q2', value: 92, color: 0x4ecdc4 },
      { label: 'Q3', value: 78, color: 0x45b7d1 },
      { label: 'Q4', value: 96, color: 0xf9ca24 },
    ]);
    setAnimationProgress(0);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive Data Visualization
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={addDataPoint} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Data Point
        </button>
        <button onClick={resetData} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reset Data
        </button>
      </div>

      <div style={{ 
        width: '800px', 
        height: '500px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={800} height={500} backgroundColor={0x1a1a2e}>
          <AnimationController setAnimationProgress={setAnimationProgress} />
          {/* Background */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x1a1a2e });
              graphics.rect(0, 0, 800, 500);
              graphics.fill();
            }}
          />
          
          {/* Title */}
          <pixiText
            text="Interactive Data Visualization Dashboard"
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
          
          {/* Bar Chart */}
          <pixiContainer x={0} y={0}>
            <pixiText
              text="Bar Chart (Click bars)"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={200}
              y={80}
              anchor={0.5}
            />
            
            <pixiGraphics draw={drawBarChart} />
            
            {/* Bar labels */}
            {data.map((item, index) => (
              <pixiText
                key={index}
                text={item.label}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 14,
                  fill: 0xffffff,
                  align: 'center',
                })}
                x={140 + index * 100}
                y={320}
                anchor={0.5}
              />
            ))}
            
            {/* Interactive bars */}
            {data.map((item, index) => (
              <pixiGraphics
                key={`interactive-${index}`}
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                  graphics.rect(100 + index * 100, 100, 80, 200);
                  graphics.fill();
                }}
                interactive={true}
                pointerdown={() => handleBarClick(index)}
              />
            ))}
          </pixiContainer>
          
          {/* Pie Chart */}
          <pixiContainer x={400} y={0}>
            <pixiText
              text="Pie Chart"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={100}
              y={80}
              anchor={0.5}
            />
            
            <pixiGraphics draw={drawPieChart} />
          </pixiContainer>
          
          {/* Line Chart */}
          <pixiContainer x={0} y={350}>
            <pixiText
              text="Line Chart"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={250}
              y={20}
              anchor={0.5}
            />
            
            <pixiGraphics draw={drawLineChart} />
          </pixiContainer>
          
          {/* Legend */}
          <pixiContainer x={500} y={350}>
            <pixiText
              text="Legend"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={0}
              y={0}
              anchor={0}
            />
            
            {data.map((item, index) => (
              <pixiContainer key={`legend-${index}`} x={0} y={30 + index * 25}>
                <pixiGraphics
                  draw={(graphics) => {
                    graphics.clear();
                    graphics.setFillStyle({ color: item.color });
                    graphics.rect(0, 0, 15, 15);
                    graphics.fill();
                  }}
                />
                <pixiText
                  text={`${item.label}: ${item.value}%`}
                  style={new TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: 0xffffff,
                    align: 'left',
                  })}
                  x={20}
                  y={7}
                  anchor={0}
                />
              </pixiContainer>
            ))}
          </pixiContainer>
          
          {/* Hover info */}
          {hoveredIndex >= 0 && (
            <pixiContainer x={400} y={450}>
              <pixiGraphics
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
                  graphics.rect(0, 0, 200, 40);
                  graphics.fill();
                  
                  graphics.setStrokeStyle({ color: 0xffffff, width: 1 });
                  graphics.rect(0, 0, 200, 40);
                  graphics.stroke();
                }}
              />
              <pixiText
                text={`${data[hoveredIndex].label}: ${data[hoveredIndex].value}%`}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 14,
                  fill: 0xffffff,
                  align: 'center',
                })}
                x={100}
                y={20}
                anchor={0.5}
              />
            </pixiContainer>
          )}
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Multiple Chart Types:</strong> Bar chart, pie chart, and line chart</li>
          <li><strong>Interactive Elements:</strong> Click bars to highlight, hover effects</li>
          <li><strong>Animated Transitions:</strong> Smooth data loading animations</li>
          <li><strong>Dynamic Data:</strong> Add/remove data points in real-time</li>
          <li><strong>Professional Styling:</strong> Shadows, highlights, and clean design</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveDataVisualization;
