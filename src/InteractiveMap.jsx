import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const AnimationController = ({ setAnimationTime }) => {
  useTick(() => {
    setAnimationTime(prev => prev + 0.1);
  });
  
  return null;
};

const InteractiveMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.5);
  const [animationTime, setAnimationTime] = useState(0);
  const [routeVisible, setRouteVisible] = useState(false);

  const locations = [
    { id: 1, name: 'New York', x: 200, y: 150, population: 8.4, color: 0xff6b6b },
    { id: 2, name: 'Los Angeles', x: 100, y: 200, population: 4.0, color: 0x4ecdc4 },
    { id: 3, name: 'Chicago', x: 180, y: 180, population: 2.7, color: 0x45b7d1 },
    { id: 4, name: 'Houston', x: 160, y: 250, population: 2.3, color: 0xf9ca24 },
    { id: 5, name: 'Phoenix', x: 120, y: 220, population: 1.7, color: 0x6c5ce7 },
    { id: 6, name: 'Philadelphia', x: 220, y: 160, population: 1.6, color: 0xfd79a8 },
    { id: 7, name: 'San Antonio', x: 150, y: 270, population: 1.5, color: 0x00b894 },
    { id: 8, name: 'San Diego', x: 80, y: 210, population: 1.4, color: 0xe17055 },
  ];

  const drawMapBackground = useCallback((graphics) => {
    graphics.clear();
    
    // Map background
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 800, 500);
    graphics.fill();
    
    // Grid lines
    graphics.setStrokeStyle({ color: 0x2a2a4e, width: 1 });
    for (let x = 0; x <= 800; x += 40) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 500);
    }
    for (let y = 0; y <= 500; y += 40) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    graphics.stroke();
  }, []);

  const drawHeatmap = useCallback((graphics) => {
    if (!showHeatmap) return;
    
    graphics.clear();
    
    locations.forEach(location => {
      const intensity = heatmapIntensity * (location.population / 8.4);
      const radius = 50 + intensity * 30;
      const alpha = 0.3 + intensity * 0.4;
      
      // Heatmap circle
      graphics.setFillStyle({ color: 0xff6b6b, alpha: alpha });
      graphics.circle(location.x, location.y, radius);
      graphics.fill();
      
      // Pulsing effect
      const pulseRadius = radius + Math.sin(animationTime * 2) * 10;
      graphics.setFillStyle({ color: 0xff6b6b, alpha: alpha * 0.5 });
      graphics.circle(location.x, location.y, pulseRadius);
      graphics.fill();
    });
  }, [showHeatmap, heatmapIntensity, animationTime]);

  const drawRoute = useCallback((graphics) => {
    if (!routeVisible) return;
    
    graphics.clear();
    
    // Animated route line
    const routePoints = [
      { x: 200, y: 150 }, // New York
      { x: 180, y: 180 }, // Chicago
      { x: 160, y: 250 }, // Houston
      { x: 150, y: 270 }, // San Antonio
      { x: 120, y: 220 }, // Phoenix
      { x: 80, y: 210 },  // San Diego
      { x: 100, y: 200 }, // Los Angeles
    ];
    
    graphics.setStrokeStyle({ color: 0x00ff88, width: 3 });
    
    for (let i = 0; i < routePoints.length - 1; i++) {
      const start = routePoints[i];
      const end = routePoints[i + 1];
      
      // Animated line segment
      const progress = (Math.sin(animationTime + i) + 1) / 2;
      const currentX = start.x + (end.x - start.x) * progress;
      const currentY = start.y + (end.y - start.y) * progress;
      
      graphics.moveTo(start.x, start.y);
      graphics.lineTo(currentX, currentY);
    }
    graphics.stroke();
    
    // Route markers
    routePoints.forEach((point, index) => {
      graphics.setFillStyle({ color: 0x00ff88 });
      graphics.circle(point.x, point.y, 4);
      graphics.fill();
      
      graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
      graphics.circle(point.x, point.y, 4);
      graphics.stroke();
    });
  }, [routeVisible, animationTime]);

  const drawLocationMarkers = useCallback((graphics) => {
    graphics.clear();
    
    locations.forEach(location => {
      const isSelected = selectedLocation === location.id;
      const scale = isSelected ? 1.2 : 1;
      const pulseScale = 1 + Math.sin(animationTime * 3 + location.id) * 0.1;
      
      // Marker shadow
      graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
      graphics.circle(location.x + 2, location.y + 2, 8 * scale * pulseScale);
      graphics.fill();
      
      // Marker
      graphics.setFillStyle({ color: location.color });
      graphics.circle(location.x, location.y, 8 * scale * pulseScale);
      graphics.fill();
      
      // Marker border
      graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
      graphics.circle(location.x, location.y, 8 * scale * pulseScale);
      graphics.stroke();
      
      // Selected marker highlight
      if (isSelected) {
        graphics.setStrokeStyle({ color: 0x00ff88, width: 3 });
        graphics.circle(location.x, location.y, 12 * scale * pulseScale);
        graphics.stroke();
      }
    });
  }, [selectedLocation, animationTime]);

  const drawLocationLabels = useCallback((graphics) => {
    graphics.clear();
    
    locations.forEach(location => {
      const isSelected = selectedLocation === location.id;
      
      if (isSelected) {
        // Background for selected label
        graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
        graphics.rect(location.x - 40, location.y - 35, 80, 25);
        graphics.fill();
        
        graphics.setStrokeStyle({ color: 0x00ff88, width: 1 });
        graphics.rect(location.x - 40, location.y - 35, 80, 25);
        graphics.stroke();
      }
    });
  }, [selectedLocation]);

  const handleLocationClick = (locationId) => {
    setSelectedLocation(selectedLocation === locationId ? null : locationId);
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const toggleRoute = () => {
    setRouteVisible(!routeVisible);
  };

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive Map with Markers
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={toggleHeatmap}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: showHeatmap ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
        <button 
          onClick={toggleRoute}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: routeVisible ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {routeVisible ? 'Hide Route' : 'Show Route'}
        </button>
        <label style={{ marginLeft: '20px', color: '#6c757d' }}>
          Heatmap Intensity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={heatmapIntensity}
            onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
            style={{ marginLeft: '10px' }}
          />
          {Math.round(heatmapIntensity * 100)}%
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          width: '800px', 
          height: '500px', 
          border: '2px solid #34495e',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Application width={800} height={500} backgroundColor={0x1a1a2e}>
            <AnimationController setAnimationTime={setAnimationTime} />
            {/* Map Background */}
            <pixiGraphics draw={drawMapBackground} />
            
            {/* Title */}
            <pixiText
              text="Interactive City Map"
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
            
            {/* Heatmap Layer */}
            <pixiGraphics draw={drawHeatmap} />
            
            {/* Route Layer */}
            <pixiGraphics draw={drawRoute} />
            
            {/* Location Labels Background */}
            <pixiGraphics draw={drawLocationLabels} />
            
            {/* Location Markers */}
            <pixiGraphics draw={drawLocationMarkers} />
            
            {/* Interactive Click Areas */}
            {locations.map(location => (
              <pixiGraphics
                key={`click-${location.id}`}
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                  graphics.circle(location.x, location.y, 20);
                  graphics.fill();
                }}
                interactive={true}
                pointerdown={() => handleLocationClick(location.id)}
              />
            ))}
            
            {/* Location Labels */}
            {locations.map(location => (
              <pixiText
                key={`label-${location.id}`}
                text={location.name}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: selectedLocation === location.id ? 14 : 12,
                  fill: selectedLocation === location.id ? 0x00ff88 : 0xffffff,
                  align: 'center',
                  fontWeight: selectedLocation === location.id ? 'bold' : 'normal',
                })}
                x={location.x}
                y={location.y - 25}
                anchor={0.5}
              />
            ))}
            
            {/* Legend */}
            <pixiContainer x={650} y={100}>
              <pixiGraphics
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0x000000, alpha: 0.8 });
                  graphics.rect(0, 0, 140, 200);
                  graphics.fill();
                  
                  graphics.setStrokeStyle({ color: 0x333333, width: 1 });
                  graphics.rect(0, 0, 140, 200);
                  graphics.stroke();
                }}
              />
              
              <pixiText
                text="Legend"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 16,
                  fill: 0x00ff88,
                  align: 'center',
                  fontWeight: 'bold',
                })}
                x={70}
                y={15}
                anchor={0.5}
              />
              
              <pixiText
                text="• Cities"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={10}
                y={40}
                anchor={0}
              />
              
              <pixiText
                text="• Population Heatmap"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xff6b6b,
                  align: 'left',
                })}
                x={10}
                y={60}
                anchor={0}
              />
              
              <pixiText
                text="• Travel Route"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0x00ff88,
                  align: 'left',
                })}
                x={10}
                y={80}
                anchor={0}
              />
              
              <pixiText
                text="Click cities to select"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 10,
                  fill: 0x888888,
                  align: 'center',
                })}
                x={70}
                y={180}
                anchor={0.5}
              />
            </pixiContainer>
          </Application>
        </div>
        
        {/* Location Details Panel */}
        <div style={{ 
          width: '300px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#212529' }}>Location Details</h3>
          
          {selectedLocationData ? (
            <div>
              <h4 style={{ color: '#495057', marginBottom: '10px' }}>{selectedLocationData.name}</h4>
              <div style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                <p><strong>Population:</strong> {selectedLocationData.population} million</p>
                <p><strong>Coordinates:</strong> ({selectedLocationData.x}, {selectedLocationData.y})</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Last Updated:</strong> Just now</p>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h5 style={{ color: '#495057', marginBottom: '10px' }}>Quick Actions</h5>
                <button style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '12px'
                }}>
                  View Details
                </button>
                <button style={{ 
                  padding: '6px 12px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  Add to Route
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <p>Click on a city marker to view details</p>
              <p style={{ marginTop: '20px' }}>
                <strong>Available Cities:</strong>
              </p>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {locations.map(location => (
                  <li key={location.id} style={{ marginBottom: '5px' }}>
                    {location.name} ({location.population}M)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Interactive Markers:</strong> Click cities to select and view details</li>
          <li><strong>Population Heatmap:</strong> Visual representation of city populations</li>
          <li><strong>Animated Route:</strong> Travel route with moving animation</li>
          <li><strong>Real-time Updates:</strong> Pulsing markers and smooth animations</li>
          <li><strong>Detailed Information:</strong> Location details panel with quick actions</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveMap;
