import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const AnimationController = ({ setTime, setMetrics, isLive }) => {
  useTick(() => {
    setTime(prev => prev + 0.1);
    
    if (isLive) {
      setMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 5)),
      }));
    }
  });
  
  return null;
};

const RealTimeDashboard = () => {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 67,
    network: 23,
    disk: 89,
  });
  const [isLive, setIsLive] = useState(true);
  const [time, setTime] = useState(0);

  const drawGauge = useCallback((graphics, value, x, y, color, label) => {
    graphics.clear();
    
    const radius = 60;
    const centerX = x;
    const centerY = y;
    
    // Background circle
    graphics.setStrokeStyle({ color: 0x333333, width: 8 });
    graphics.circle(centerX, centerY, radius);
    graphics.stroke();
    
    // Progress arc
    const progress = value / 100;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (progress * Math.PI * 2);
    
    graphics.setStrokeStyle({ color: color, width: 8 });
    graphics.arc(centerX, centerY, radius, startAngle, endAngle);
    graphics.stroke();
    
    // Center text
    graphics.setFillStyle({ color: 0xffffff });
    graphics.circle(centerX, centerY, 30);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: 0x333333, width: 2 });
    graphics.circle(centerX, centerY, 30);
    graphics.stroke();
  }, []);

  const drawLineGraph = useCallback((graphics, data, x, y, width, height, color) => {
    graphics.clear();
    
    // Background
    graphics.setFillStyle({ color: 0x222222 });
    graphics.rect(x, y, width, height);
    graphics.fill();
    
    // Grid lines
    graphics.setStrokeStyle({ color: 0x333333, width: 1 });
    for (let i = 0; i <= 4; i++) {
      const gridY = y + (height / 4) * i;
      graphics.moveTo(x, gridY);
      graphics.lineTo(x + width, gridY);
    }
    
    // Line graph
    if (data.length > 1) {
      graphics.setStrokeStyle({ color: color, width: 2 });
      graphics.moveTo(x, y + height - (data[0] / 100) * height);
      
      for (let i = 1; i < data.length; i++) {
        const lineX = x + (width / (data.length - 1)) * i;
        const lineY = y + height - (data[i] / 100) * height;
        graphics.lineTo(lineX, lineY);
      }
      graphics.stroke();
    }
  }, []);

  const drawStatusIndicator = useCallback((graphics, status, x, y) => {
    graphics.clear();
    
    const color = status === 'online' ? 0x00ff00 : status === 'warning' ? 0xffaa00 : 0xff0000;
    const pulseScale = 1 + Math.sin(time * 5) * 0.1;
    
    graphics.setFillStyle({ color: color, alpha: 0.8 });
    graphics.circle(x, y, 8 * pulseScale);
    graphics.fill();
    
    graphics.setStrokeStyle({ color: color, width: 2 });
    graphics.circle(x, y, 8 * pulseScale);
    graphics.stroke();
  }, [time]);

  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);

  useEffect(() => {
    if (isLive) {
      setCpuHistory(prev => [...prev.slice(-19), metrics.cpu]);
      setMemoryHistory(prev => [...prev.slice(-19), metrics.memory]);
    }
  }, [metrics.cpu, metrics.memory, isLive]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const resetMetrics = () => {
    setMetrics({
      cpu: 45,
      memory: 67,
      network: 23,
      disk: 89,
    });
    setCpuHistory([]);
    setMemoryHistory([]);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Real-Time System Dashboard
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={toggleLive}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isLive ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLive ? 'Stop Live' : 'Start Live'}
        </button>
        <button 
          onClick={resetMetrics}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <span style={{ marginLeft: '20px', color: '#6c757d' }}>
          Status: {isLive ? '🟢 Live' : '⏸️ Paused'}
        </span>
      </div>

      <div style={{ 
        width: '1000px', 
        height: '600px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={1000} height={600} backgroundColor={0x0a0a0a}>
          <AnimationController setTime={setTime} setMetrics={setMetrics} isLive={isLive} />
          {/* Background */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x0a0a0a });
              graphics.rect(0, 0, 1000, 600);
              graphics.fill();
            }}
          />
          
          {/* Title */}
          <pixiText
            text="System Monitoring Dashboard"
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
          
          {/* CPU Gauge */}
          <pixiContainer x={100} y={100}>
            <pixiGraphics draw={(graphics) => drawGauge(graphics, metrics.cpu, 0, 0, 0xff6b6b, 'CPU')} />
            <pixiText
              text={`${Math.round(metrics.cpu)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={0}
              y={0}
              anchor={0.5}
            />
            <pixiText
              text="CPU Usage"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={0}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Memory Gauge */}
          <pixiContainer x={300} y={100}>
            <pixiGraphics draw={(graphics) => drawGauge(graphics, metrics.memory, 0, 0, 0x4ecdc4, 'Memory')} />
            <pixiText
              text={`${Math.round(metrics.memory)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={0}
              y={0}
              anchor={0.5}
            />
            <pixiText
              text="Memory Usage"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={0}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Network Gauge */}
          <pixiContainer x={500} y={100}>
            <pixiGraphics draw={(graphics) => drawGauge(graphics, metrics.network, 0, 0, 0x45b7d1, 'Network')} />
            <pixiText
              text={`${Math.round(metrics.network)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={0}
              y={0}
              anchor={0.5}
            />
            <pixiText
              text="Network I/O"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={0}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Disk Gauge */}
          <pixiContainer x={700} y={100}>
            <pixiGraphics draw={(graphics) => drawGauge(graphics, metrics.disk, 0, 0, 0xf9ca24, 'Disk')} />
            <pixiText
              text={`${Math.round(metrics.disk)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={0}
              y={0}
              anchor={0.5}
            />
            <pixiText
              text="Disk Usage"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xffffff,
                align: 'center',
              })}
              x={0}
              y={80}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* CPU History Graph */}
          <pixiContainer x={50} y={250}>
            <pixiText
              text="CPU History"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={150}
              y={-20}
              anchor={0.5}
            />
            <pixiGraphics draw={(graphics) => drawLineGraph(graphics, cpuHistory, 0, 0, 300, 120, 0xff6b6b)} />
          </pixiContainer>
          
          {/* Memory History Graph */}
          <pixiContainer x={400} y={250}>
            <pixiText
              text="Memory History"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x00ff88,
                align: 'center',
              })}
              x={150}
              y={-20}
              anchor={0.5}
            />
            <pixiGraphics draw={(graphics) => drawLineGraph(graphics, memoryHistory, 0, 0, 300, 120, 0x4ecdc4)} />
          </pixiContainer>
          
          {/* System Status */}
          <pixiContainer x={750} y={250}>
            <pixiText
              text="System Status"
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
            
            <pixiContainer x={0} y={30}>
              <pixiGraphics draw={(graphics) => drawStatusIndicator(graphics, 'online', 10, 10)} />
              <pixiText
                text="Web Server"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={25}
                y={5}
                anchor={0}
              />
            </pixiContainer>
            
            <pixiContainer x={0} y={60}>
              <pixiGraphics draw={(graphics) => drawStatusIndicator(graphics, 'online', 10, 10)} />
              <pixiText
                text="Database"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={25}
                y={5}
                anchor={0}
              />
            </pixiContainer>
            
            <pixiContainer x={0} y={90}>
              <pixiGraphics draw={(graphics) => drawStatusIndicator(graphics, 'warning', 10, 10)} />
              <pixiText
                text="Cache Service"
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 12,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={25}
                y={5}
                anchor={0}
              />
            </pixiContainer>
          </pixiContainer>
          
          {/* Alerts Panel */}
          <pixiContainer x={50} y={400}>
            <pixiText
              text="Recent Alerts"
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
            
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x222222 });
                graphics.rect(0, 25, 400, 150);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0x333333, width: 1 });
                graphics.rect(0, 25, 400, 150);
                graphics.stroke();
              }}
            />
            
            <pixiText
              text="• CPU usage exceeded 80% at 14:32"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xff6b6b,
                align: 'left',
              })}
              x={10}
              y={40}
              anchor={0}
            />
            
            <pixiText
              text="• Memory usage high at 14:28"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffaa00,
                align: 'left',
              })}
              x={10}
              y={60}
              anchor={0}
            />
            
            <pixiText
              text="• Disk space low at 14:15"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xff6b6b,
                align: 'left',
              })}
              x={10}
              y={80}
              anchor={0}
            />
            
            <pixiText
              text="• Network connection restored at 14:10"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x00ff00,
                align: 'left',
              })}
              x={10}
              y={100}
              anchor={0}
            />
          </pixiContainer>
          
          {/* Performance Metrics */}
          <pixiContainer x={500} y={400}>
            <pixiText
              text="Performance Metrics"
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
            
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x222222 });
                graphics.rect(0, 25, 200, 150);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0x333333, width: 1 });
                graphics.rect(0, 25, 200, 150);
                graphics.stroke();
              }}
            />
            
            <pixiText
              text={`Response Time: ${(Math.random() * 100 + 50).toFixed(1)}ms`}
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
              text={`Throughput: ${(Math.random() * 1000 + 500).toFixed(0)} req/s`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={10}
              y={60}
              anchor={0}
            />
            
            <pixiText
              text={`Error Rate: ${(Math.random() * 2).toFixed(2)}%`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={10}
              y={80}
              anchor={0}
            />
            
            <pixiText
              text={`Uptime: ${Math.floor(time / 10)}s`}
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xffffff,
                align: 'left',
              })}
              x={10}
              y={100}
              anchor={0}
            />
          </pixiContainer>
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Real-time Monitoring:</strong> Live updating metrics with smooth animations</li>
          <li><strong>Multiple Visualizations:</strong> Gauges, line graphs, and status indicators</li>
          <li><strong>System Status:</strong> Service health monitoring with visual indicators</li>
          <li><strong>Alert System:</strong> Recent alerts and performance metrics</li>
          <li><strong>Interactive Controls:</strong> Start/stop live updates and reset functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
