import React, { useState, useCallback, useEffect } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';

extend({ Container, Graphics, Text });

const ProductShowcase = () => {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(-1);
  const [animationTime, setAnimationTime] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Premium Headphones',
      price: '$299',
      rating: 4.8,
      color: 0xff6b6b,
      features: ['Noise Cancelling', 'Wireless', '30h Battery'],
      image: '🎧'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: '$399',
      rating: 4.6,
      color: 0x4ecdc4,
      features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
      image: '⌚'
    },
    {
      id: 3,
      name: 'Gaming Mouse',
      price: '$89',
      rating: 4.9,
      color: 0x45b7d1,
      features: ['RGB Lighting', 'High DPI', 'Programmable'],
      image: '🖱️'
    },
    {
      id: 4,
      name: 'Wireless Speaker',
      price: '$199',
      rating: 4.7,
      color: 0xf9ca24,
      features: ['360° Sound', 'Voice Control', 'Portable'],
      image: '🔊'
    },
    {
      id: 5,
      name: 'Tablet Pro',
      price: '$599',
      rating: 4.8,
      color: 0x6c5ce7,
      features: ['4K Display', 'Stylus Support', 'All Day Battery'],
      image: '📱'
    },
  ];

  const AnimationController = () => {
    useTick(() => {
      setAnimationTime(prev => prev + 0.1);
      
      if (isAutoPlaying) {
        setSelectedProduct(prev => (prev + 1) % products.length);
      }
    });
    
    return null;
  };

  const drawProductCard = useCallback((graphics, product, x, y, scale = 1, isSelected = false) => {
    graphics.clear();
    
    const cardWidth = 180 * scale;
    const cardHeight = 220 * scale;
    const cornerRadius = 15 * scale;
    
    // Card shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.3 });
    graphics.rect(x + 5, y + 5, cardWidth, cardHeight, cornerRadius);
    graphics.fill();
    
    // Card background
    graphics.setFillStyle({ color: 0xffffff });
    graphics.rect(x, y, cardWidth, cardHeight, cornerRadius);
    graphics.fill();
    
    // Card border
    graphics.setStrokeStyle({ 
      color: isSelected ? 0x00ff88 : 0xe0e0e0, 
      width: isSelected ? 3 : 1 
    });
    graphics.rect(x, y, cardWidth, cardHeight, cornerRadius);
    graphics.stroke();
    
    // Product image background
    graphics.setFillStyle({ color: product.color, alpha: 0.1 });
    graphics.rect(x + 10, y + 10, cardWidth - 20, 80 * scale, 10 * scale);
    graphics.fill();
    
    // Product highlight
    graphics.setFillStyle({ color: product.color, alpha: 0.2 });
    graphics.rect(x + 10, y + 10, cardWidth - 20, 40 * scale, 10 * scale);
    graphics.fill();
  }, []);

  const drawStarRating = useCallback((graphics, rating, x, y, size = 12) => {
    graphics.clear();
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      const starX = x + i * (size + 2);
      const starY = y;
      
      if (i < fullStars) {
        // Full star
        graphics.setFillStyle({ color: 0xffd700 });
        drawStar(graphics, starX, starY, size);
        graphics.fill();
      } else if (i === fullStars && hasHalfStar) {
        // Half star
        graphics.setFillStyle({ color: 0xffd700 });
        drawStar(graphics, starX, starY, size);
        graphics.fill();
        
        graphics.setFillStyle({ color: 0xe0e0e0 });
        graphics.rect(starX - size/2, starY, size, size);
        graphics.fill();
      } else {
        // Empty star
        graphics.setFillStyle({ color: 0xe0e0e0 });
        drawStar(graphics, starX, starY, size);
        graphics.fill();
      }
    }
  }, []);

  const drawStar = (graphics, x, y, size) => {
    const outerRadius = size;
    const innerRadius = size * 0.4;
    const spikes = 5;
    const step = Math.PI / spikes;
    
    graphics.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const starX = x + Math.cos(angle) * radius;
      const starY = y + Math.sin(angle) * radius;
      graphics.lineTo(starX, starY);
    }
    
    graphics.closePath();
  };

  const drawMainProduct = useCallback((graphics) => {
    const product = products[selectedProduct];
    graphics.clear();
    
    // Main product background
    graphics.setFillStyle({ color: 0x1a1a2e });
    graphics.rect(0, 0, 400, 300);
    graphics.fill();
    
    // Product card
    drawProductCard(graphics, product, 50, 50, 1.5, true);
    
    // Product image
    graphics.setFillStyle({ color: product.color });
    graphics.circle(230, 130, 40);
    graphics.fill();
    
    // Product glow effect
    const glowRadius = 40 + Math.sin(animationTime * 2) * 5;
    graphics.setFillStyle({ color: product.color, alpha: 0.3 });
    graphics.circle(230, 130, glowRadius);
    graphics.fill();
  }, [selectedProduct, animationTime]);

  const drawProductGrid = useCallback((graphics) => {
    graphics.clear();
    
    products.forEach((product, index) => {
      const x = 50 + (index % 3) * 200;
      const y = 400 + Math.floor(index / 3) * 250;
      const isHovered = hoveredProduct === index;
      const scale = isHovered ? 1.1 : 1;
      
      drawProductCard(graphics, product, x, y, scale, false);
    });
  }, [hoveredProduct]);

  const drawFloatingElements = useCallback((graphics) => {
    graphics.clear();
    
    // Floating particles
    for (let i = 0; i < 20; i++) {
      const x = 50 + (i * 37) % 700;
      const y = 50 + Math.sin(animationTime + i) * 20;
      const size = 2 + Math.sin(animationTime * 2 + i) * 1;
      
      graphics.setFillStyle({ color: 0x00ff88, alpha: 0.6 });
      graphics.circle(x, y, size);
      graphics.fill();
    }
  }, [animationTime]);

  const handleProductClick = (index) => {
    setSelectedProduct(index);
    setIsAutoPlaying(false);
  };

  const handleProductHover = (index) => {
    setHoveredProduct(index);
  };

  const handleProductLeave = () => {
    setHoveredProduct(-1);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const nextProduct = () => {
    setSelectedProduct(prev => (prev + 1) % products.length);
    setIsAutoPlaying(false);
  };

  const prevProduct = () => {
    setSelectedProduct(prev => (prev - 1 + products.length) % products.length);
    setIsAutoPlaying(false);
  };

  const currentProduct = products[selectedProduct];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Interactive Product Showcase
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={prevProduct}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Previous
        </button>
        <button 
          onClick={nextProduct}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next →
        </button>
        <button 
          onClick={toggleAutoPlay}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isAutoPlaying ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isAutoPlaying ? 'Stop Auto' : 'Auto Play'}
        </button>
        <span style={{ marginLeft: '20px', color: '#6c757d' }}>
          Product {selectedProduct + 1} of {products.length}
        </span>
      </div>

      <div style={{ 
        width: '1000px', 
        height: '700px', 
        border: '2px solid #34495e',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Application width={1000} height={700} backgroundColor={0x0a0a0a}>
          <AnimationController />
          {/* Background */}
          <pixiGraphics
            draw={(graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 0x0a0a0a });
              graphics.rect(0, 0, 1000, 700);
              graphics.fill();
            }}
          />
          
          {/* Floating Elements */}
          <pixiGraphics draw={drawFloatingElements} />
          
          {/* Title */}
          <pixiText
            text="Premium Product Collection"
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
          
          {/* Main Product Display */}
          <pixiGraphics draw={drawMainProduct} />
          
          {/* Main Product Info */}
          <pixiText
            text={currentProduct.name}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xffffff,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={500}
            y={200}
            anchor={0.5}
          />
          
          <pixiText
            text={currentProduct.price}
            style={new TextStyle({
              fontFamily: 'Arial',
              fontSize: 32,
              fill: 0x00ff88,
              align: 'center',
              fontWeight: 'bold',
            })}
            x={500}
            y={240}
            anchor={0.5}
          />
          
          {/* Star Rating */}
          <pixiGraphics draw={(graphics) => drawStarRating(graphics, currentProduct.rating, 450, 280)} />
          
          {/* Product Features */}
          <pixiContainer x={500} y={320}>
            {currentProduct.features.map((feature, index) => (
              <pixiText
                key={index}
                text={`• ${feature}`}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 14,
                  fill: 0xffffff,
                  align: 'left',
                })}
                x={0}
                y={index * 20}
                anchor={0}
              />
            ))}
          </pixiContainer>
          
          {/* Product Grid */}
          <pixiGraphics draw={drawProductGrid} />
          
          {/* Interactive Product Cards */}
          {products.map((product, index) => (
            <pixiContainer key={`interactive-${index}`} x={50 + (index % 3) * 200} y={400 + Math.floor(index / 3) * 250}>
              <pixiGraphics
                draw={(graphics) => {
                  graphics.clear();
                  graphics.setFillStyle({ color: 0xffffff, alpha: 0 });
                  graphics.rect(0, 0, 180, 220);
                  graphics.fill();
                }}
                interactive={true}
                pointerdown={() => handleProductClick(index)}
                pointerover={() => handleProductHover(index)}
                pointerout={handleProductLeave}
              />
              
              {/* Product Image */}
              <pixiText
                text={product.image}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 40,
                  align: 'center',
                })}
                x={90}
                y={60}
                anchor={0.5}
              />
              
              {/* Product Name */}
              <pixiText
                text={product.name}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 14,
                  fill: 0x333333,
                  align: 'center',
                  fontWeight: 'bold',
                })}
                x={90}
                y={120}
                anchor={0.5}
              />
              
              {/* Product Price */}
              <pixiText
                text={product.price}
                style={new TextStyle({
                  fontFamily: 'Arial',
                  fontSize: 16,
                  fill: product.color,
                  align: 'center',
                  fontWeight: 'bold',
                })}
                x={90}
                y={145}
                anchor={0.5}
              />
              
              {/* Star Rating */}
              <pixiGraphics draw={(graphics) => drawStarRating(graphics, product.rating, 50, 170, 10)} />
            </pixiContainer>
          ))}
          
          {/* Add to Cart Button */}
          <pixiContainer x={500} y={450}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0x00ff88 });
                graphics.rect(0, 0, 200, 50, 25);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0xffffff, width: 2 });
                graphics.rect(0, 0, 200, 50, 25);
                graphics.stroke();
              }}
              interactive={true}
              pointerdown={() => alert(`Added ${currentProduct.name} to cart!`)}
            />
            
            <pixiText
              text="Add to Cart"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={100}
              y={25}
              anchor={0.5}
            />
          </pixiContainer>
          
          {/* Wishlist Button */}
          <pixiContainer x={500} y={520}>
            <pixiGraphics
              draw={(graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 0xffffff });
                graphics.rect(0, 0, 200, 50, 25);
                graphics.fill();
                
                graphics.setStrokeStyle({ color: 0x00ff88, width: 2 });
                graphics.rect(0, 0, 200, 50, 25);
                graphics.stroke();
              }}
              interactive={true}
              pointerdown={() => alert(`Added ${currentProduct.name} to wishlist!`)}
            />
            
            <pixiText
              text="Add to Wishlist"
              style={new TextStyle({
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x00ff88,
                align: 'center',
                fontWeight: 'bold',
              })}
              x={100}
              y={25}
              anchor={0.5}
            />
          </pixiContainer>
        </Application>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '5px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features:</h3>
        <ul style={{ color: '#34495e', lineHeight: '1.6' }}>
          <li><strong>Interactive Product Cards:</strong> Hover effects and click interactions</li>
          <li><strong>3D-like Effects:</strong> Shadows, highlights, and scaling animations</li>
          <li><strong>Star Rating System:</strong> Visual rating display with half-star support</li>
          <li><strong>Auto-play Mode:</strong> Automatic product rotation</li>
          <li><strong>Shopping Actions:</strong> Add to cart and wishlist functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductShowcase;
