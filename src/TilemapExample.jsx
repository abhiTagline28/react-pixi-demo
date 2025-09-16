import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const TilemapExample = () => {
  const [tilemap, setTilemap] = useState([]);
  const [selectedTile, setSelectedTile] = useState(1);
  const [brushSize, setBrushSize] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [tileSize] = useState(32);
  const [mapWidth] = useState(20);
  const [mapHeight] = useState(15);

  const tileTypes = [
    { id: 0, name: 'Empty', color: 0x000000 },
    { id: 1, name: 'Grass', color: 0x4ecdc4 },
    { id: 2, name: 'Water', color: 0x45b7d1 },
    { id: 3, name: 'Stone', color: 0x6c757d },
    { id: 4, name: 'Sand', color: 0xf9ca24 },
    { id: 5, name: 'Tree', color: 0x28a745 },
    { id: 6, name: 'Mountain', color: 0x6c5ce7 },
    { id: 7, name: 'Lava', color: 0xdc3545 },
  ];

  const AnimationController = () => {
    useTick(() => {
      setAnimationTime(prev => prev + 0.1);
    });
    
    return null;
  };

  // Initialize tilemap
  useEffect(() => {
    const initialTilemap = [];
    for (let y = 0; y < mapHeight; y++) {
      const row = [];
      for (let x = 0; x < mapWidth; x++) {
        row.push(0); // Empty tiles
      }
      initialTilemap.push(row);
    }
    setTilemap(initialTilemap);
  }, [mapWidth, mapHeight]);

  const drawTilemap = useCallback((graphics) => {
    graphics.clear();
    
    tilemap.forEach((row, y) => {
      row.forEach((tileId, x) => {
        const tileType = tileTypes[tileId];
        const pixelX = x * tileSize;
        const pixelY = y * tileSize;
        
        // Draw tile
        graphics.setFillStyle({ color: tileType.color });
        graphics.rect(pixelX, pixelY, tileSize, tileSize);
        graphics.fill();
        
        // Draw tile pattern
        if (tileId === 1) { // Grass
          graphics.setFillStyle({ color: 0x2ecc71 });
          graphics.circle(pixelX + tileSize/2, pixelY + tileSize/2, 2);
          graphics.fill();
        } else if (tileId === 2) { // Water
          const waveY = pixelY + Math.sin(animationTime + x) * 2;
          graphics.setFillStyle({ color: 0x3498db });
          graphics.rect(pixelX, waveY, tileSize, 4);
          graphics.fill();
        } else if (tileId === 5) { // Tree
          graphics.setFillStyle({ color: 0x8b4513 });
          graphics.rect(pixelX + tileSize/2 - 2, pixelY + tileSize - 8, 4, 8);
          graphics.fill();
          graphics.setFillStyle({ color: 0x228b22 });
          graphics.circle(pixelX + tileSize/2, pixelY + tileSize - 12, 6);
          graphics.fill();
        } else if (tileId === 6) { // Mountain
          graphics.setFillStyle({ color: 0x696969 });
          graphics.moveTo(pixelX, pixelY + tileSize);
          graphics.lineTo(pixelX + tileSize/2, pixelY);
          graphics.lineTo(pixelX + tileSize, pixelY + tileSize);
          graphics.closePath();
          graphics.fill();
        } else if (tileId === 7) { // Lava
          graphics.setFillStyle({ color: 0xff4500 });
          graphics.rect(pixelX, pixelY, tileSize, tileSize);
          graphics.fill();
          graphics.setFillStyle({ color: 0xffd700 });
          graphics.circle(pixelX + tileSize/2, pixelY + tileSize/2, 3);
          graphics.fill();
        }
        
        // Draw tile border
        graphics.setStrokeStyle({ color: 0x333333, width: 1 });
        graphics.rect(pixelX, pixelY, tileSize, tileSize);
        graphics.stroke();
      });
    });
  }, [tilemap, tileSize, animationTime]);

  const drawGrid = useCallback((graphics) => {
    if (!showGrid) return;
    
    graphics.clear();
    
    // Vertical lines
    graphics.setStrokeStyle({ color: 0x666666, width: 1, alpha: 0.5 });
    for (let x = 0; x <= mapWidth; x++) {
      graphics.moveTo(x * tileSize, 0);
      graphics.lineTo(x * tileSize, mapHeight * tileSize);
    }
    
    // Horizontal lines
    for (let y = 0; y <= mapHeight; y++) {
      graphics.moveTo(0, y * tileSize);
      graphics.lineTo(mapWidth * tileSize, y * tileSize);
    }
    graphics.stroke();
  }, [showGrid, mapWidth, mapHeight, tileSize]);

  const drawTilePalette = useCallback((graphics) => {
    graphics.clear();
    
    tileTypes.forEach((tileType, index) => {
      const x = index * 40;
      const y = 0;
      const isSelected = selectedTile === tileType.id;
      
      // Tile background
      graphics.setFillStyle({ color: tileType.color });
      graphics.rect(x, y, 35, 35);
      graphics.fill();
      
      // Selection border
      if (isSelected) {
        graphics.setStrokeStyle({ color: 0x00ff88, width: 3 });
        graphics.rect(x - 2, y - 2, 39, 39);
        graphics.stroke();
      } else {
        graphics.setStrokeStyle({ color: 0x333333, width: 1 });
        graphics.rect(x, y, 35, 35);
        graphics.stroke();
      }
    });
  }, [selectedTile]);

  const drawBrushPreview = useCallback((graphics, x, y) => {
    graphics.clear();
    
    const centerX = Math.floor(x / tileSize) * tileSize + tileSize / 2;
    const centerY = Math.floor(y / tileSize) * tileSize + tileSize / 2;
    
    graphics.setStrokeStyle({ color: 0x00ff88, width: 2 });
    
    if (brushSize === 1) {
      graphics.rect(centerX - tileSize/2, centerY - tileSize/2, tileSize, tileSize);
    } else if (brushSize === 3) {
      graphics.rect(centerX - tileSize * 1.5, centerY - tileSize * 1.5, tileSize * 3, tileSize * 3);
    } else if (brushSize === 5) {
      graphics.rect(centerX - tileSize * 2.5, centerY - tileSize * 2.5, tileSize * 5, tileSize * 5);
    }
    
    graphics.stroke();
  }, [brushSize, tileSize]);

  const placeTile = useCallback((x, y) => {
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    
    if (tileX >= 0 && tileX < mapWidth && tileY >= 0 && tileY < mapHeight) {
      setTilemap(prevTilemap => {
        const newTilemap = prevTilemap.map(row => [...row]);
        
        // Place tiles based on brush size
        for (let dy = -Math.floor(brushSize / 2); dy <= Math.floor(brushSize / 2); dy++) {
          for (let dx = -Math.floor(brushSize / 2); dx <= Math.floor(brushSize / 2); dx++) {
            const newX = tileX + dx;
            const newY = tileY + dy;
            
            if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
              newTilemap[newY][newX] = selectedTile;
            }
          }
        }
        
        return newTilemap;
      });
    }
  }, [selectedTile, brushSize, mapWidth, mapHeight, tileSize]);

  const handleTilemapClick = useCallback((event) => {
    if (event.data) {
      const position = event.data.getLocalPosition(event.currentTarget);
      placeTile(position.x, position.y);
    }
  }, [placeTile]);

  const handleTilemapMouseMove = useCallback((event) => {
    if (event.data) {
      const position = event.data.getLocalPosition(event.currentTarget);
      // Update brush preview position
    }
  }, []);

  const handleTilePaletteClick = useCallback((tileId) => {
    setSelectedTile(tileId);
  }, []);

  const clearTilemap = useCallback(() => {
    const emptyTilemap = [];
    for (let y = 0; y < mapHeight; y++) {
      const row = [];
      for (let x = 0; x < mapWidth; x++) {
        row.push(0);
      }
      emptyTilemap.push(row);
    }
    setTilemap(emptyTilemap);
  }, [mapWidth, mapHeight]);

  const generateRandomMap = useCallback(() => {
    const randomTilemap = [];
    for (let y = 0; y < mapHeight; y++) {
      const row = [];
      for (let x = 0; x < mapWidth; x++) {
        // Generate terrain based on position
        let tileId = 0;
        const distanceFromCenter = Math.sqrt((x - mapWidth/2) ** 2 + (y - mapHeight/2) ** 2);
        
        if (distanceFromCenter < 3) {
          tileId = 7; // Lava center
        } else if (distanceFromCenter < 6) {
          tileId = 6; // Mountain ring
        } else if (distanceFromCenter < 8) {
          tileId = 3; // Stone ring
        } else if (Math.random() < 0.1) {
          tileId = 5; // Random trees
        } else if (Math.random() < 0.05) {
          tileId = 2; // Random water
        } else {
          tileId = 1; // Grass
        }
        
        row.push(tileId);
      }
      randomTilemap.push(row);
    }
    setTilemap(randomTilemap);
  }, [mapWidth, mapHeight]);

  const saveTilemap = useCallback(() => {
    const tilemapData = {
      width: mapWidth,
      height: mapHeight,
      tileSize: tileSize,
      tiles: tilemap,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(tilemapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tilemap.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [tilemap, mapWidth, mapHeight, tileSize]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive Tilemap Editor
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={clearTilemap}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Map
        </button>
        <button 
          onClick={generateRandomMap}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Generate Random
        </button>
        <button 
          onClick={saveTilemap}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Save Map
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
          Brush Size: {brushSize}x{brushSize}
          <input
            type="range"
            min="1"
            max="5"
            step="2"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <span style={{ color: '#6c757d' }}>
          Selected: {tileTypes[selectedTile].name}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          width: '640px', 
          height: '480px', 
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Application width={640} height={480} backgroundColor={0x1a1a2e}>
            <AnimationController />
            {/* Background */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x1a1a2e });
                graphics.rect(0, 0, 640, 480);
                graphics.fill();
              }}
            />
            
            {/* Title */}
            <pixiText
              text="Tilemap Editor"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={320}
              y={20}
              anchor={0.5}
            />
            
            {/* Tilemap */}
            <pixiGraphics draw={drawTilemap} />
            
            {/* Grid */}
            <pixiGraphics draw={drawGrid} />
            
            {/* Interactive Click Area */}
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                graphics.rect(0, 50, 640, 400);
                graphics.fill();
              }}
              interactive={true}
              pointerdown={handleTilemapClick}
              pointermove={handleTilemapMouseMove}
            />
            
            {/* Info Panel */}
            <pixiContainer x={20} y={460}>
              <pixiGraphics
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
                  graphics.rect(0, 0, 200, 20);
                  graphics.fill();
                }}
              />
              <pixiText
                text={`Map: ${mapWidth}x${mapHeight} | Tiles: ${tileSize}px`}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={10}
                y={10}
                anchor={0}
              />
            </pixiContainer>
          </Application>
        </div>
        
        {/* Tile Palette */}
        <div style={{ 
          width: '300px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Tile Palette</h3>
          
          <div style={{ 
            width: '280px', 
            height: '200px', 
            border: '2px solid #34495e',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <Application width={280} height={200} backgroundColor={0x2c3e50}>
              <pixiGraphics draw={drawTilePalette} />
              
              {/* Interactive Tile Selection */}
              {tileTypes.map((tileType, index) => (
                <pixiGraphics
                  key={tileType.id}
                  draw={(graphics) => {
                    graphics.clear();
                    graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                    graphics.rect(index * 40, 0, 35, 35);
                    graphics.fill();
                  }}
                  interactive={true}
                  pointerdown={() => handleTilePaletteClick(tileType.id)}
                />
              ))}
            </Application>
          </div>
          
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <p><strong>Instructions:</strong></p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Click tiles in palette to select</li>
              <li>Click on map to place tiles</li>
              <li>Use brush size slider for larger areas</li>
              <li>Toggle grid on/off as needed</li>
            </ul>
            
            <div style={{ marginTop: '20px' }}>
              <p><strong>Current Selection:</strong></p>
              <div style={{ 
                display: 'inline-block', 
                width: '20px', 
                height: '20px', 
                backgroundColor: `#${tileTypes[selectedTile].color.toString(16).padStart(6, '0')}`,
                border: '1px solid #333',
                marginRight: '10px',
                verticalAlign: 'middle'
              }}></div>
              <span>{tileTypes[selectedTile].name}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Interactive Editing:</strong> Click to place tiles with customizable brush sizes</li>
          <li><strong>Tile Types:</strong> 8 different tile types with unique patterns and animations</li>
          <li><strong>Visual Grid:</strong> Toggle-able grid overlay for precise tile placement</li>
          <li><strong>Map Generation:</strong> Random terrain generation with realistic patterns</li>
          <li><strong>Save/Load:</strong> Export tilemap data as JSON for persistence</li>
          <li><strong>Animated Tiles:</strong> Water waves, lava bubbles, and other dynamic effects</li>
        </ul>
      </div>
    </div>
  );
};

export default TilemapExample;