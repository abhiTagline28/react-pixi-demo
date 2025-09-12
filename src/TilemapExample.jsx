import { Container, Graphics, Sprite, Texture, Assets } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
});

const TilemapExample = () => {
  const [texture, setTexture] = useState(Texture.EMPTY);
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("https://pixijs.com/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  useEffect(() => {
    // Create a simple tilemap
    const tileSize = 32;
    const mapWidth = 15;
    const mapHeight = 10;
    const newTiles = [];

    // Create a simple pattern
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileType = Math.random() > 0.7 ? 1 : 0; // 30% chance of wall
        if (tileType === 1) {
          newTiles.push({
            x: x * tileSize,
            y: y * tileSize,
            type: tileType,
            color: Math.random() > 0.5 ? 0x4a90e2 : 0x7ed321,
          });
        }
      }
    }
    setTiles(newTiles);
  }, []);

  const drawTile = useCallback((graphics, tile) => {
    graphics.clear();
    graphics.setFillStyle({ color: tile.color });
    graphics.rect(tile.x, tile.y, 32, 32);
    graphics.fill();
    graphics.setStrokeStyle({ color: 0x333333, width: 1 });
    graphics.rect(tile.x, tile.y, 32, 32);
    graphics.stroke();
  }, []);

  const drawGrid = useCallback((graphics) => {
    graphics.clear();
    graphics.setStrokeStyle({ color: 0x666666, width: 1 });
    
    // Draw vertical lines
    for (let x = 0; x <= 15; x++) {
      graphics.moveTo(x * 32, 0);
      graphics.lineTo(x * 32, 320);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= 10; y++) {
      graphics.moveTo(0, y * 32);
      graphics.lineTo(480, y * 32);
    }
    graphics.stroke();
  }, []);

  return (
    <>
      <h1>Tilemap Example</h1>
      <Application width={480} height={320}>
        {/* Grid */}
        <pixiGraphics draw={drawGrid} />
        
        {/* Tiles */}
        {tiles.map((tile, index) => (
          <pixiGraphics key={index} draw={(graphics) => drawTile(graphics, tile)} />
        ))}
        
        {/* Character */}
        <pixiSprite
          texture={texture}
          x={64}
          y={64}
          anchor={0.5}
          scale={0.5}
        />
      </Application>
    </>
  );
};

export default TilemapExample;
