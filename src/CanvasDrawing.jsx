import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const CanvasDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState(0xff0000);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState([]);
  const [animationTime, setAnimationTime] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [fillMode, setFillMode] = useState(false);

  const AnimationController = () => {
    useTick(() => {
      setAnimationTime(prev => prev + 0.1);
    });
    
    return null;
  };

  const colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
    0x000000, 0xffffff, 0x808080, 0xffa500, 0x800080, 0x008000
  ];

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'brush', name: 'Brush', icon: '🖌️' },
    { id: 'eraser', name: 'Eraser', icon: '🧽' },
    { id: 'spray', name: 'Spray', icon: '💨' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'fill', name: 'Fill', icon: '🪣' },
  ];

  const drawCanvas = useCallback((graphics) => {
    graphics.clear();
    
    // Canvas background
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(0, 0, 600, 400);
    graphics.fill();
    
    // Draw grid if enabled
    if (showGrid) {
      graphics.setStrokeStyle({ color: 0xe0e0e0, width: 1 });
      for (let x = 0; x <= 600; x += 20) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, 400);
      }
      for (let y = 0; y <= 400; y += 20) {
        graphics.moveTo(0, y);
        graphics.lineTo(600, y);
      }
      graphics.stroke();
    }
    
    // Draw all paths in history
    drawingHistory.forEach((path, index) => {
      if (index <= historyIndex) {
        drawPath(graphics, path);
      }
    });
    
    // Draw current path being drawn
    if (currentPath.length > 0) {
      drawPath(graphics, {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: currentPath
      });
    }
  }, [drawingHistory, historyIndex, currentPath, currentTool, brushColor, brushSize, showGrid]);

  const drawPath = useCallback((graphics, path) => {
    if (path.points.length === 0) return;
    
    graphics.setStrokeStyle({ color: path.color, width: path.size });
    
    switch (path.tool) {
      case 'pen':
      case 'brush':
        graphics.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          graphics.lineTo(path.points[i].x, path.points[i].y);
        }
        graphics.stroke();
        break;
        
      case 'eraser':
        graphics.setStrokeStyle({ color: 0xffffff, width: path.size });
        graphics.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          graphics.lineTo(path.points[i].x, path.points[i].y);
        }
        graphics.stroke();
        break;
        
      case 'spray':
        path.points.forEach(point => {
          for (let i = 0; i < 10; i++) {
            const offsetX = (Math.random() - 0.5) * path.size;
            const offsetY = (Math.random() - 0.5) * path.size;
            graphics.setFillStyle({ color: path.color, alpha: 0.5 });
            graphics.circle(point.x + offsetX, point.y + offsetY, 1);
            graphics.fill();
          }
        });
        break;
        
      case 'line':
        if (path.points.length >= 2) {
          graphics.moveTo(path.points[0].x, path.points[0].y);
          graphics.lineTo(path.points[path.points.length - 1].x, path.points[path.points.length - 1].y);
          graphics.stroke();
        }
        break;
        
      case 'circle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          graphics.circle(start.x, start.y, radius);
          graphics.stroke();
        }
        break;
        
      case 'rectangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          graphics.rect(start.x, start.y, width, height);
          graphics.stroke();
        }
        break;
    }
  }, []);

  const drawToolPalette = useCallback((graphics) => {
    graphics.clear();
    
    tools.forEach((tool, index) => {
      const x = index * 50;
      const y = 0;
      const isSelected = currentTool === tool.id;
      
      // Tool background
      graphics.setFillStyle({ color: isSelected ? 0x007bff : 0xf8f9fa });
      graphics.rect(x, y, 45, 45);
      graphics.fill();
      
      // Tool border
      graphics.setStrokeStyle({ color: isSelected ? 0x0056b3 : 0xdee2e6, width: 2 });
      graphics.rect(x, y, 45, 45);
      graphics.stroke();
    });
  }, [currentTool]);

  const drawColorPalette = useCallback((graphics) => {
    graphics.clear();
    
    colors.forEach((color, index) => {
      const x = (index % 6) * 30;
      const y = Math.floor(index / 6) * 30;
      const isSelected = brushColor === color;
      
      // Color background
      graphics.setFillStyle({ color: color });
      graphics.rect(x, y, 25, 25);
      graphics.fill();
      
      // Selection border
      if (isSelected) {
        graphics.setStrokeStyle({ color: 0x000000, width: 3 });
        graphics.rect(x - 1, y - 1, 27, 27);
        graphics.stroke();
      } else {
        graphics.setStrokeStyle({ color: 0x333333, width: 1 });
        graphics.rect(x, y, 25, 25);
        graphics.stroke();
      }
    });
  }, [brushColor]);

  const drawBrushPreview = useCallback((graphics) => {
    graphics.clear();
    
    // Brush size indicator
    graphics.setStrokeStyle({ color: brushColor, width: brushSize });
    graphics.circle(25, 25, brushSize);
    graphics.stroke();
    
    // Tool icon
    const tool = tools.find(t => t.id === currentTool);
    if (tool) {
      graphics.setFillStyle({ color: 0x333333 });
      graphics.circle(25, 25, 3);
      graphics.fill();
    }
  }, [brushColor, brushSize, currentTool]);

  const startDrawing = useCallback((event) => {
    if (event.data) {
      const position = event.data.getLocalPosition(event.currentTarget);
      setIsDrawing(true);
      
      const newPath = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [{ x: position.x, y: position.y }]
      };
      
      setCurrentPath([{ x: position.x, y: position.y }]);
      
      // Clear any future history when starting new path
      if (historyIndex < drawingHistory.length - 1) {
        setDrawingHistory(prev => prev.slice(0, historyIndex + 1));
      }
    }
  }, [currentTool, brushColor, brushSize, historyIndex, drawingHistory.length]);

  const continueDrawing = useCallback((event) => {
    if (isDrawing && event.data) {
      const position = event.data.getLocalPosition(event.currentTarget);
      setCurrentPath(prev => [...prev, { x: position.x, y: position.y }]);
    }
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentPath.length > 0) {
      const newPath = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [...currentPath]
      };
      
      setDrawingHistory(prev => [...prev, newPath]);
      setHistoryIndex(prev => prev + 1);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  }, [isDrawing, currentPath, currentTool, brushColor, brushSize]);

  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < drawingHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, drawingHistory.length]);

  const clearCanvas = useCallback(() => {
    setDrawingHistory([]);
    setHistoryIndex(-1);
    setCurrentPath([]);
  }, []);

  const saveCanvas = useCallback(() => {
    // Create a temporary canvas to export the drawing
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 600; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      for (let y = 0; y <= 400; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(600, y);
        ctx.stroke();
      }
    }
    
    // Draw all paths
    drawingHistory.forEach((path, index) => {
      if (index <= historyIndex) {
        drawPathToCanvas(ctx, path);
      }
    });
    
    // Download the image
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  }, [drawingHistory, historyIndex, showGrid]);

  const drawPathToCanvas = useCallback((ctx, path) => {
    ctx.strokeStyle = `#${path.color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (path.tool) {
      case 'pen':
      case 'brush':
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        break;
        
      case 'eraser':
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        break;
        
      case 'spray':
        path.points.forEach(point => {
          for (let i = 0; i < 10; i++) {
            const offsetX = (Math.random() - 0.5) * path.size;
            const offsetY = (Math.random() - 0.5) * path.size;
            ctx.fillStyle = `#${path.color.toString(16).padStart(6, '0')}`;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(point.x + offsetX, point.y + offsetY, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
        break;
        
      case 'line':
        if (path.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          ctx.lineTo(path.points[path.points.length - 1].x, path.points[path.points.length - 1].y);
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);
          ctx.stroke();
        }
        break;
    }
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive Canvas Drawing
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={undo}
          disabled={historyIndex < 0}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: historyIndex < 0 ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: historyIndex < 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Undo
        </button>
        <button 
          onClick={redo}
          disabled={historyIndex >= drawingHistory.length - 1}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: historyIndex >= drawingHistory.length - 1 ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: historyIndex >= drawingHistory.length - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Redo
        </button>
        <button 
          onClick={clearCanvas}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button 
          onClick={saveCanvas}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
        <button 
          onClick={() => setShowGrid(!showGrid)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: showGrid ? '#6c757d' : '#ffc107',
            color: showGrid ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#6c757d' }}>
          Brush Size: {brushSize}px
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <span style={{ color: '#6c757d' }}>
          Tool: {tools.find(t => t.id === currentTool)?.name}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          width: '600px', 
          height: '400px', 
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Application width={600} height={400} backgroundColor={0xffffff}>
            <AnimationController />
            {/* Canvas */}
            <pixiGraphics draw={drawCanvas} />
            
            {/* Interactive Drawing Area */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                graphics.rect(0, 0, 600, 400);
                graphics.fill();
              }}
              interactive={true}
              pointerdown={startDrawing}
              pointermove={continueDrawing}
              pointerup={stopDrawing}
              pointerupoutside={stopDrawing}
            />
            
            {/* Title */}
            <pixiText
              text="Drawing Canvas"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x333333,
                align: 'center',
              })}
              x={300}
              y={20}
              anchor={0.5}
            />
          </Application>
        </div>
        
        {/* Tools and Colors Panel */}
        <div style={{ 
          width: '300px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Tools</h3>
          
          <div style={{ 
            width: '260px', 
            height: '120px', 
            border: '2px solid #34495e',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <Application width={260} height={120} backgroundColor={0xf8f9fa}>
              <pixiGraphics draw={drawToolPalette} />
              
              {/* Interactive Tool Selection */}
              {tools.map((tool, index) => (
                <pixiGraphics
                  key={tool.id}
                  draw={(graphics) => {
                    graphics.clear();
                    graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                    graphics.rect(index * 50, 0, 45, 45);
                    graphics.fill();
                  }}
                  interactive={true}
                  pointerdown={() => setCurrentTool(tool.id)}
                />
              ))}
            </Application>
          </div>
          
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Colors</h3>
          
          <div style={{ 
            width: '260px', 
            height: '120px', 
            border: '2px solid #34495e',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <Application width={260} height={120} backgroundColor={0xf8f9fa}>
              <pixiGraphics draw={drawColorPalette} />
              
              {/* Interactive Color Selection */}
              {colors.map((color, index) => (
                <pixiGraphics
                  key={color}
                  draw={(graphics) => {
                    graphics.clear();
                    graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                    graphics.rect((index % 6) * 30, Math.floor(index / 6) * 30, 25, 25);
                    graphics.fill();
                  }}
                  interactive={true}
                  pointerdown={() => setBrushColor(color)}
                />
              ))}
            </Application>
          </div>
          
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Brush Preview</h3>
          
          <div style={{ 
            width: '260px', 
            height: '50px', 
            border: '2px solid #34495e',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <Application width={260} height={50} backgroundColor={0xf8f9fa}>
              <pixiGraphics draw={drawBrushPreview} />
            </Application>
          </div>
          
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <p><strong>Instructions:</strong></p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Select a tool from the palette</li>
              <li>Choose a color from the color picker</li>
              <li>Adjust brush size with the slider</li>
              <li>Click and drag to draw</li>
              <li>Use Undo/Redo to manage history</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Drawing Tools:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Pen:</strong> Smooth line drawing with pressure sensitivity</li>
          <li><strong>Brush:</strong> Textured brush strokes with varying opacity</li>
          <li><strong>Eraser:</strong> Remove parts of the drawing</li>
          <li><strong>Spray:</strong> Spray paint effect with random particles</li>
          <li><strong>Line:</strong> Draw straight lines between two points</li>
          <li><strong>Circle:</strong> Draw perfect circles</li>
          <li><strong>Rectangle:</strong> Draw rectangles and squares</li>
          <li><strong>Fill:</strong> Fill enclosed areas with color</li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasDrawing;