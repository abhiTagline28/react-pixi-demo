import { Container, Graphics, Sprite, Texture, Assets, Text } from "pixi.js";
import { useEffect, useState, useCallback } from "react";
import { Application, extend, useTick } from "@pixi/react";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

const GraphicsCoinChild = ({
  coinRotation,
  isFlipping,
  result,
  setCoinRotation,
  setCoinScale,
  setCoinY,
  setCoinX,
  setIsFlipping,
  drawCoin,
  drawBackground,
  drawResultCoin,
  showCoin,
  coverX,
  setCoverX,
  coverMoving,
  setCoverMoving,
  showLauncher,
  setShowLauncher,
  setCoinResult,
  setShowResultEnabled,
  setTryAgainEnabled,
  setSlowFlipRotation,
  setShowCoin,
  createParticle,
  setParticles,
}) => {
  const [flipCount, setFlipCount] = useState(0);
  const [fingerAnimationTime, setFingerAnimationTime] = useState(0);

  useTick(() => {
    // Update finger animation time for continuous finger movement
    setFingerAnimationTime((prev) => prev + 0.1);

    // Horizontal flipping animation with increasing speed as cover approaches
    if (!isFlipping && coverX > 300 && !result) {
      const distanceFromTarget = coverX - 300;
      const maxDistance = 300;
      const speedMultiplier =
        1 + (maxDistance - distanceFromTarget) / maxDistance;
      const baseSpeed = 0.15;
      const currentSpeed = baseSpeed * speedMultiplier;

      setSlowFlipRotation((prev) => prev + currentSpeed);
    }

    // Handle cover movement to hide coin
    if (coverMoving && coverX > 300 && !isFlipping) {
      setCoverX((prev) => {
        const distanceFromTarget = prev - 300;
        const speedMultiplier = Math.max(
          0.3,
          Math.min(2.0, distanceFromTarget / 50)
        );
        const newX = prev - 8 * speedMultiplier;

        if (prev === 600 && newX === 595) {
          const randomResult = Math.random() < 0.5 ? "heads" : "tails";
          setCoinResult(randomResult);
          setShowCoin(false);
        }

        if (newX <= 300) {
          setCoverMoving(false);
          return 300;
        }
        return newX;
      });
    }

    if (isFlipping) {
      setFlipCount((prev) => prev + 1);

      const time = flipCount * 0.016;

      const easeOutQuad = (t) => t * (2 - t);

      // Enhanced phase-based animation with realistic physics
      if (flipCount < 25) {
        const moveProgress = flipCount / 25;
        const easedProgress = easeOutQuad(moveProgress);

        setCoverX(() => {
          const startX = 300;
          const endX = 520;
          return startX + (endX - startX) * easedProgress;
        });

        setCoinY(() => 250);
        setCoinX(() => 300);
        setCoinRotation((prev) => prev + 0.08);
        setCoinScale(() => 1);
      } else if (flipCount < 35) {
        setShowLauncher(true);
        setCoinY(() => 250);
        setCoinX(() => 300);
        setCoinRotation((prev) => prev + 0.12);
        setCoinScale(() => 1 + Math.sin(time * 8) * 0.05);
      } else if (flipCount < 85) {
        const launchProgress = (flipCount - 35) / 50;
        const easedProgress = easeOutQuad(launchProgress);

        setCoinY(() => {
          const startY = 250;
          const endY = 50;
          const arcOffset = Math.sin(launchProgress * Math.PI) * 15;
          return startY + (endY - startY) * easedProgress - arcOffset;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.5) * 4;
          const launchDrift = Math.sin(launchProgress * Math.PI) * 8;
          return 300 + drift + launchDrift;
        });

        setCoinRotation((prev) => prev + 1.8);
        setCoinScale(
          () =>
            1 +
            Math.sin(time * 20) * 0.2 +
            Math.sin(launchProgress * Math.PI) * 0.1
        );
      } else if (flipCount < 125) {
        setCoinY(() => {
          const hoverY = 50 + Math.sin(time * 6) * 8;
          const gravityDrift = (flipCount - 85) * 0.3;
          return Math.max(hoverY - gravityDrift, 45);
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.8) * 3;
          return 300 + drift;
        });

        setCoinRotation((prev) => prev + 1.6);
        setCoinScale(() => 1 + Math.sin(time * 22) * 0.25);
      } else if (flipCount < 175) {
        const fallProgress = (flipCount - 125) / 50;

        if (flipCount === 125) {
          setShowLauncher(false);
        }

        setCoinY(() => {
          const startY = 50;
          const endY = 250;
          const gravityAcceleration = Math.pow(fallProgress, 1.5);
          return startY + (endY - startY) * gravityAcceleration;
        });

        setCoinX(() => {
          const drift = Math.sin(time * 2.2) * 2;
          const fallTrajectory = Math.sin(fallProgress * Math.PI) * 6;
          return 300 + drift + fallTrajectory;
        });

        setCoinRotation((prev) => prev + 1.2);
        setCoinScale(() => 1 + Math.sin(time * 25) * 0.2);
      } else if (flipCount < 200) {
        const settleProgress = (flipCount - 175) / 25;

        setCoinY((prev) => {
          const targetY = 250;
          const diff = targetY - prev;
          const bounceAmplitude = 15 * Math.pow(1 - settleProgress, 2);
          const bounce =
            Math.sin(settleProgress * Math.PI * 3) * bounceAmplitude;
          return prev + diff * 0.3 + bounce;
        });

        setCoinX((prev) => {
          const targetX = 300;
          const diff = targetX - prev;
          const settleOvershoot = Math.sin(settleProgress * Math.PI) * 3;
          return prev + diff * 0.25 + settleOvershoot;
        });

        setCoinRotation((prev) => prev + 0.3);
        setCoinScale((prev) => {
          const targetScale = 1;
          const diff = targetScale - prev;
          return prev + diff * 0.2;
        });
      }

      if (flipCount > 200) {
        setIsFlipping(false);
        setFlipCount(0);
        setCoverX(300);

        const finalRotation = coinRotation % (Math.PI * 2);
        const flipResult = finalRotation < Math.PI ? "heads" : "tails";

        setCoinResult(flipResult);

        // Create celebration particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const distance = 30;
          const particleX = 300 + Math.cos(angle) * distance;
          const particleY = 250 + Math.sin(angle) * distance;
          const celebrationParticle = createParticle(
            particleX,
            particleY,
            flipResult === "heads" ? "gold" : "silver"
          );
          setParticles((prev) => [...prev, celebrationParticle]);
        }

        setShowResultEnabled(true);
        setTryAgainEnabled(true);
        setCoverX(300);
      }
    }
  });

  // Draw stylized modern hand graphics - NEW DESIGN
  const drawBaseHand = useCallback(
    (graphics, x, y) => {
      graphics.clear();

      // Modern stylized colors - Blue gradient theme
      const handBase = 0x4a90e2; // Modern blue
      const handShadow = 0x357abd; // Darker blue
      const handHighlight = 0x7bb3f0; // Light blue
      const handAccent = 0x2c5aa0; // Dark accent
      const handGlow = 0x87ceeb; // Sky blue glow

      // Calculate finger animation offsets
      const fingerWave1 = Math.sin(fingerAnimationTime * 2) * 3;
      const fingerWave2 = Math.sin(fingerAnimationTime * 2.3 + 1) * 2.5;
      const fingerWave3 = Math.sin(fingerAnimationTime * 1.8 + 2) * 3.5;
      const fingerWave4 = Math.sin(fingerAnimationTime * 2.1 + 3) * 2.8;

      // Draw palm with modern rounded square shape (rotated 90 degrees)
      graphics.setFillStyle({ color: handBase });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15); // Rotated: width=50, height=60
      graphics.fill();

      // Palm shadow for depth
      graphics.setFillStyle({ color: handShadow });
      graphics.roundRect(x - 23, y - 32, 46, 56, 13);
      graphics.fill();

      // Palm highlight with gradient effect
      graphics.setFillStyle({ color: handHighlight, alpha: 0.7 });
      graphics.roundRect(x - 20, y - 25, 40, 50, 12);
      graphics.fill();

      // Modern geometric palm lines (rotated)
      graphics.setStrokeStyle({ color: handAccent, width: 2 });
      graphics.moveTo(x - 2, y - 20);
      graphics.lineTo(x + 30, y - 5);
      graphics.stroke();

      graphics.moveTo(x + 2, y - 12);
      graphics.lineTo(x + 35, y + 2);
      graphics.stroke();

      // Add modern geometric patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.3 });
      graphics.circle(x + 10, y - 15, 8);
      graphics.fill();
      graphics.circle(x + 15, y + 10, 6);
      graphics.fill();

      // Draw fingers with modern stylized design and animation (rotated 90 degrees - pointing right)
      const fingers = [
        {
          name: "pinky",
          x: x - 8,
          y: y - 42,
          animationOffset: fingerWave1,
          segments: [
            { x: x - 8, y: y - 42 + fingerWave1 * 0.3, width: 18, height: 10 },
            { x: x - 20, y: y - 42 + fingerWave1 * 0.6, width: 15, height: 9 },
            { x: x - 30, y: y - 42 + fingerWave1 * 0.9, width: 12, height: 8 },
          ],
        },
        {
          name: "ring",
          x: x - 12,
          y: y - 27,
          animationOffset: fingerWave2,
          segments: [
            { x: x - 12, y: y - 27 + fingerWave2 * 0.3, width: 21, height: 12 },
            { x: x - 26, y: y - 27 + fingerWave2 * 0.6, width: 18, height: 11 },
            { x: x - 38, y: y - 27 + fingerWave2 * 0.9, width: 15, height: 10 },
          ],
        },
        {
          name: "middle",
          x: x - 18,
          y: y - 12,
          animationOffset: fingerWave3,
          segments: [
            { x: x - 18, y: y - 12 + fingerWave3 * 0.3, width: 24, height: 13 },
            { x: x - 35, y: y - 12 + fingerWave3 * 0.6, width: 21, height: 12 },
            { x: x - 50, y: y - 12 + fingerWave3 * 0.9, width: 18, height: 11 },
          ],
        },
        {
          name: "index",
          x: x - 12,
          y: y + 15,
          animationOffset: fingerWave4,
          segments: [
            { x: x - 12, y: y + 15 + fingerWave4 * 0.3, width: 21, height: 12 },
            { x: x - 26, y: y + 15 + fingerWave4 * 0.6, width: 18, height: 11 },
            { x: x - 38, y: y + 15 + fingerWave4 * 0.9, width: 15, height: 10 },
          ],
        },
      ];

      // Draw finger segments with modern stylized design
      fingers.forEach((finger) => {
        finger.segments.forEach((segment, index) => {
          // Main finger segment - rounded rectangles
          graphics.setFillStyle({ color: handBase });
          graphics.roundRect(
            segment.x - segment.width / 2,
            segment.y - segment.height / 2,
            segment.width,
            segment.height,
            8
          );
          graphics.fill();

          // Shadow for depth
          graphics.setFillStyle({ color: handShadow });
          graphics.roundRect(
            segment.x - segment.width / 2 + 1,
            segment.y - segment.height / 2 + 1,
            segment.width - 1,
            segment.height - 1,
            7
          );
          graphics.fill();

          // Highlight with modern gradient effect
          graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
          graphics.roundRect(
            segment.x - segment.width / 2 + 2,
            segment.y - segment.height / 2 + 2,
            segment.width * 0.7,
            segment.height * 0.5,
            6
          );
          graphics.fill();

          // Modern joint lines
          if (index < finger.segments.length - 1) {
            graphics.setStrokeStyle({ color: handAccent, width: 1 });
            graphics.moveTo(
              segment.x - segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.lineTo(
              segment.x + segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.stroke();
          }

          // Add modern accent dots
          graphics.setFillStyle({ color: handGlow, alpha: 0.5 });
          graphics.circle(segment.x, segment.y, 2);
          graphics.fill();
        });
      });

      // Draw thumb with modern stylized design (rotated 90 degrees)
      graphics.setFillStyle({ color: handBase });
      graphics.roundRect(x + 2, y + 22, 30, 22, 12); // Rotated: width=30, height=22
      graphics.fill();

      graphics.setFillStyle({ color: handShadow });
      graphics.roundRect(x + 4, y + 20, 28, 20, 10);
      graphics.fill();

      // Thumb highlight
      graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
      graphics.roundRect(x + 6, y + 24, 22, 16, 8);
      graphics.fill();

      // Draw modern stylized fingertips
      const fingertipColor = 0x00d4aa; // Teal accent
      const fingertipHighlight = 0x40e0d0; // Light teal

      fingers.forEach((finger) => {
        const tipSegment = finger.segments[finger.segments.length - 1];
        // Modern fingertip design
        graphics.setFillStyle({ color: fingertipColor });
        graphics.roundRect(
          tipSegment.x - tipSegment.width / 2,
          tipSegment.y - tipSegment.height / 2 + 1,
          tipSegment.width * 0.8,
          8,
          6
        );
        graphics.fill();

        // Fingertip highlight
        graphics.setFillStyle({ color: fingertipHighlight, alpha: 0.8 });
        graphics.roundRect(
          tipSegment.x - tipSegment.width / 2 + 1,
          tipSegment.y - tipSegment.height / 2 + 2,
          tipSegment.width * 0.5,
          5,
          4
        );
        graphics.fill();
      });

      // Draw modern hand outline (rotated 90 degrees)
      graphics.setStrokeStyle({ color: handAccent, width: 3 });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15);
      graphics.stroke();

      // Add modern tech-style patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.4 });
      for (let i = 0; i < 8; i++) {
        const dotX = x + 5 + (Math.random() - 0.5) * 25;
        const dotY = y + (Math.random() - 0.5) * 40;
        graphics.circle(dotX, dotY, 1.5);
        graphics.fill();
      }

      // Add modern accent lines (rotated)
      graphics.setStrokeStyle({ color: handGlow, alpha: 0.6, width: 1 });
      graphics.moveTo(x + 5, y - 25);
      graphics.lineTo(x + 5, y + 25);
      graphics.stroke();

      graphics.moveTo(x + 20, y - 20);
      graphics.lineTo(x + 20, y + 20);
      graphics.stroke();
    },
    [fingerAnimationTime]
  );

  const drawCoverHand = useCallback(
    (graphics, x, y) => {
      graphics.clear();

      // Modern stylized colors - Purple gradient theme for cover hand
      const handBase = 0x8a2be2; // Modern purple
      const handShadow = 0x6a1b9a; // Darker purple
      const handHighlight = 0xa855f7; // Light purple
      const handAccent = 0x4c1d95; // Dark accent
      const handGlow = 0xc084fc; // Purple glow

      // Calculate finger animation offsets for cover hand (slightly different pattern)
      const coverFingerWave1 = Math.sin(fingerAnimationTime * 1.5) * 2.5;
      const coverFingerWave2 = Math.sin(fingerAnimationTime * 1.8 + 0.5) * 3;
      const coverFingerWave3 = Math.sin(fingerAnimationTime * 1.3 + 1) * 2.8;
      const coverFingerWave4 = Math.sin(fingerAnimationTime * 1.6 + 1.5) * 2.2;

      // Draw palm with modern rounded square shape (rotated 90 degrees)
      graphics.setFillStyle({ color: handBase });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15); // Rotated: width=50, height=60
      graphics.fill();

      // Palm shadow for depth
      graphics.setFillStyle({ color: handShadow });
      graphics.roundRect(x - 23, y - 32, 46, 56, 13);
      graphics.fill();

      // Palm highlight with gradient effect
      graphics.setFillStyle({ color: handHighlight, alpha: 0.7 });
      graphics.roundRect(x - 20, y - 25, 40, 50, 12);
      graphics.fill();

      // Modern geometric palm lines (rotated)
      graphics.setStrokeStyle({ color: handAccent, width: 2 });
      graphics.moveTo(x - 2, y - 20);
      graphics.lineTo(x + 30, y - 5);
      graphics.stroke();

      graphics.moveTo(x + 2, y - 12);
      graphics.lineTo(x + 35, y + 2);
      graphics.stroke();

      // Add modern geometric patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.3 });
      graphics.circle(x + 10, y - 15, 8);
      graphics.fill();
      graphics.circle(x + 15, y + 10, 6);
      graphics.fill();

      // Draw fingers with modern stylized design (covering pose) and animation (rotated 90 degrees - pointing right)
      const fingers = [
        {
          name: "pinky",
          x: x - 5,
          y: y - 42,
          animationOffset: coverFingerWave1,
          segments: [
            {
              x: x - 5,
              y: y - 42 + coverFingerWave1 * 0.3,
              width: 15,
              height: 10,
            },
            {
              x: x - 15,
              y: y - 42 + coverFingerWave1 * 0.6,
              width: 12,
              height: 9,
            },
            {
              x: x - 23,
              y: y - 42 + coverFingerWave1 * 0.9,
              width: 10,
              height: 8,
            },
          ],
        },
        {
          name: "ring",
          x: x - 8,
          y: y - 27,
          animationOffset: coverFingerWave2,
          segments: [
            {
              x: x - 8,
              y: y - 27 + coverFingerWave2 * 0.3,
              width: 18,
              height: 12,
            },
            {
              x: x - 20,
              y: y - 27 + coverFingerWave2 * 0.6,
              width: 15,
              height: 11,
            },
            {
              x: x - 30,
              y: y - 27 + coverFingerWave2 * 0.9,
              width: 12,
              height: 10,
            },
          ],
        },
        {
          name: "middle",
          x: x - 12,
          y: y - 12,
          animationOffset: coverFingerWave3,
          segments: [
            {
              x: x - 12,
              y: y - 12 + coverFingerWave3 * 0.3,
              width: 21,
              height: 13,
            },
            {
              x: x - 28,
              y: y - 12 + coverFingerWave3 * 0.6,
              width: 18,
              height: 12,
            },
            {
              x: x - 42,
              y: y - 12 + coverFingerWave3 * 0.9,
              width: 15,
              height: 11,
            },
          ],
        },
        {
          name: "index",
          x: x - 8,
          y: y + 15,
          animationOffset: coverFingerWave4,
          segments: [
            {
              x: x - 8,
              y: y + 15 + coverFingerWave4 * 0.3,
              width: 18,
              height: 12,
            },
            {
              x: x - 20,
              y: y + 15 + coverFingerWave4 * 0.6,
              width: 15,
              height: 11,
            },
            {
              x: x - 30,
              y: y + 15 + coverFingerWave4 * 0.9,
              width: 12,
              height: 10,
            },
          ],
        },
      ];

      // Draw finger segments with modern stylized design
      fingers.forEach((finger) => {
        finger.segments.forEach((segment, index) => {
          // Main finger segment - rounded rectangles
          graphics.setFillStyle({ color: handBase });
          graphics.roundRect(
            segment.x - segment.width / 2,
            segment.y - segment.height / 2,
            segment.width,
            segment.height,
            8
          );
          graphics.fill();

          // Shadow for depth
          graphics.setFillStyle({ color: handShadow });
          graphics.roundRect(
            segment.x - segment.width / 2 + 1,
            segment.y - segment.height / 2 + 1,
            segment.width - 1,
            segment.height - 1,
            7
          );
          graphics.fill();

          // Highlight with modern gradient effect
          graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
          graphics.roundRect(
            segment.x - segment.width / 2 + 2,
            segment.y - segment.height / 2 + 2,
            segment.width * 0.7,
            segment.height * 0.5,
            6
          );
          graphics.fill();

          // Modern joint lines
          if (index < finger.segments.length - 1) {
            graphics.setStrokeStyle({ color: handAccent, width: 1 });
            graphics.moveTo(
              segment.x - segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.lineTo(
              segment.x + segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.stroke();
          }

          // Add modern accent dots
          graphics.setFillStyle({ color: handGlow, alpha: 0.5 });
          graphics.circle(segment.x, segment.y, 2);
          graphics.fill();
        });
      });

      // Draw thumb with modern stylized design (rotated 90 degrees)
      graphics.setFillStyle({ color: handBase });
      graphics.roundRect(x + 7, y + 22, 27, 22, 12); // Rotated: width=27, height=22
      graphics.fill();

      graphics.setFillStyle({ color: handShadow });
      graphics.roundRect(x + 9, y + 20, 25, 20, 10);
      graphics.fill();

      // Thumb highlight
      graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
      graphics.roundRect(x + 11, y + 24, 20, 16, 8);
      graphics.fill();

      // Draw modern stylized fingertips
      const fingertipColor = 0xff6b9d; // Pink accent for cover hand
      const fingertipHighlight = 0xff8fab; // Light pink

      fingers.forEach((finger) => {
        const tipSegment = finger.segments[finger.segments.length - 1];
        // Modern fingertip design
        graphics.setFillStyle({ color: fingertipColor });
        graphics.roundRect(
          tipSegment.x - tipSegment.width / 2,
          tipSegment.y - tipSegment.height / 2 + 1,
          tipSegment.width * 0.8,
          6,
          6
        );
        graphics.fill();

        // Fingertip highlight
        graphics.setFillStyle({ color: fingertipHighlight, alpha: 0.8 });
        graphics.roundRect(
          tipSegment.x - tipSegment.width / 2 + 1,
          tipSegment.y - tipSegment.height / 2 + 2,
          tipSegment.width * 0.5,
          4,
          4
        );
        graphics.fill();
      });

      // Draw modern hand outline (rotated 90 degrees)
      graphics.setStrokeStyle({ color: handAccent, width: 3 });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15);
      graphics.stroke();

      // Add modern tech-style patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.4 });
      for (let i = 0; i < 8; i++) {
        const dotX = x + 5 + (Math.random() - 0.5) * 25;
        const dotY = y + (Math.random() - 0.5) * 40;
        graphics.circle(dotX, dotY, 1.5);
        graphics.fill();
      }

      // Add modern accent lines (rotated)
      graphics.setStrokeStyle({ color: handGlow, alpha: 0.6, width: 1 });
      graphics.moveTo(x + 5, y - 25);
      graphics.lineTo(x + 5, y + 25);
      graphics.stroke();

      graphics.moveTo(x + 20, y - 20);
      graphics.lineTo(x + 20, y + 20);
      graphics.stroke();
    },
    [fingerAnimationTime]
  );

  const drawThumbsUpHand = useCallback(
    (graphics, x, y) => {
      graphics.clear();

      // Modern stylized colors - Green gradient theme for thumbs-up hand
      const handBase = 0x10b981; // Modern green
      const handShadow = 0x059669; // Darker green
      const handHighlight = 0x34d399; // Light green
      const handAccent = 0x047857; // Dark accent
      const handGlow = 0x6ee7b7; // Green glow

      // Calculate finger animation offsets for thumbs-up hand (more energetic)
      const thumbWave1 = Math.sin(fingerAnimationTime * 3) * 4;
      const thumbWave2 = Math.sin(fingerAnimationTime * 2.5 + 0.3) * 3.5;
      const thumbWave3 = Math.sin(fingerAnimationTime * 2.8 + 0.6) * 3.8;
      const thumbWave4 = Math.sin(fingerAnimationTime * 2.2 + 0.9) * 3.2;

      // Draw palm with modern rounded square shape (rotated 90 degrees)
      graphics.setFillStyle({ color: handBase });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15); // Rotated: width=50, height=60
      graphics.fill();

      // Palm shadow for depth
      graphics.setFillStyle({ color: handShadow });
      graphics.roundRect(x - 23, y - 32, 46, 56, 13);
      graphics.fill();

      // Palm highlight with gradient effect
      graphics.setFillStyle({ color: handHighlight, alpha: 0.7 });
      graphics.roundRect(x - 20, y - 25, 40, 50, 12);
      graphics.fill();

      // Modern geometric palm lines (rotated)
      graphics.setStrokeStyle({ color: handAccent, width: 2 });
      graphics.moveTo(x - 2, y - 20);
      graphics.lineTo(x + 30, y - 5);
      graphics.stroke();

      graphics.moveTo(x + 2, y - 12);
      graphics.lineTo(x + 35, y + 2);
      graphics.stroke();

      // Add modern geometric patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.3 });
      graphics.circle(x + 10, y - 15, 8);
      graphics.fill();
      graphics.circle(x + 15, y + 10, 6);
      graphics.fill();

      // Draw fingers (closed/fist position) with modern stylized design and animation (rotated 90 degrees - pointing right)
      const fingers = [
        {
          name: "pinky",
          x: x + 12,
          y: y - 33,
          animationOffset: thumbWave1,
          segments: [
            { x: x + 12, y: y - 33 + thumbWave1 * 0.2, width: 18, height: 9 },
            { x: x + 3, y: y - 33 + thumbWave1 * 0.4, width: 15, height: 8 },
            { x: x - 5, y: y - 33 + thumbWave1 * 0.6, width: 12, height: 7 },
          ],
        },
        {
          name: "ring",
          x: x + 8,
          y: y - 18,
          animationOffset: thumbWave2,
          segments: [
            { x: x + 8, y: y - 18 + thumbWave2 * 0.2, width: 21, height: 10 },
            { x: x - 3, y: y - 18 + thumbWave2 * 0.4, width: 18, height: 9 },
            { x: x - 14, y: y - 18 + thumbWave2 * 0.6, width: 15, height: 8 },
          ],
        },
        {
          name: "middle",
          x: x + 5,
          y: y - 3,
          animationOffset: thumbWave3,
          segments: [
            { x: x + 5, y: y - 3 + thumbWave3 * 0.2, width: 24, height: 12 },
            { x: x - 8, y: y - 3 + thumbWave3 * 0.4, width: 21, height: 11 },
            { x: x - 22, y: y - 3 + thumbWave3 * 0.6, width: 18, height: 10 },
          ],
        },
        {
          name: "index",
          x: x + 8,
          y: y + 18,
          animationOffset: thumbWave4,
          segments: [
            { x: x + 8, y: y + 18 + thumbWave4 * 0.2, width: 21, height: 10 },
            { x: x - 3, y: y + 18 + thumbWave4 * 0.4, width: 18, height: 9 },
            { x: x - 14, y: y + 18 + thumbWave4 * 0.6, width: 15, height: 8 },
          ],
        },
      ];

      // Draw finger segments with modern stylized design
      fingers.forEach((finger) => {
        finger.segments.forEach((segment, index) => {
          // Main finger segment - rounded rectangles
          graphics.setFillStyle({ color: handBase });
          graphics.roundRect(
            segment.x - segment.width / 2,
            segment.y - segment.height / 2,
            segment.width,
            segment.height,
            8
          );
          graphics.fill();

          // Shadow for depth
          graphics.setFillStyle({ color: handShadow });
          graphics.roundRect(
            segment.x - segment.width / 2 + 1,
            segment.y - segment.height / 2 + 1,
            segment.width - 1,
            segment.height - 1,
            7
          );
          graphics.fill();

          // Highlight with modern gradient effect
          graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
          graphics.roundRect(
            segment.x - segment.width / 2 + 2,
            segment.y - segment.height / 2 + 2,
            segment.width * 0.7,
            segment.height * 0.5,
            6
          );
          graphics.fill();

          // Modern joint lines
          if (index < finger.segments.length - 1) {
            graphics.setStrokeStyle({ color: handAccent, width: 1 });
            graphics.moveTo(
              segment.x - segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.lineTo(
              segment.x + segment.width / 2,
              segment.y + segment.height / 2
            );
            graphics.stroke();
          }

          // Add modern accent dots
          graphics.setFillStyle({ color: handGlow, alpha: 0.5 });
          graphics.circle(segment.x, segment.y, 2);
          graphics.fill();
        });
      });

      // Draw thumb (thumbs up position) with modern stylized segments and animation (rotated 90 degrees)
      const thumbWave = Math.sin(fingerAnimationTime * 4) * 5; // More energetic thumb animation
      const thumbSegments = [
        { x: x - 8, y: y + 37 + thumbWave * 0.2, width: 27, height: 18 },
        { x: x - 23, y: y + 37 + thumbWave * 0.5, width: 24, height: 15 },
        { x: x - 38, y: y + 37 + thumbWave * 0.8, width: 21, height: 12 },
      ];

      thumbSegments.forEach((segment, index) => {
        graphics.setFillStyle({ color: handBase });
        graphics.roundRect(
          segment.x - segment.width / 2,
          segment.y - segment.height / 2,
          segment.width,
          segment.height,
          10
        );
        graphics.fill();

        graphics.setFillStyle({ color: handShadow });
        graphics.roundRect(
          segment.x - segment.width / 2 + 1,
          segment.y - segment.height / 2 + 1,
          segment.width - 1,
          segment.height - 1,
          9
        );
        graphics.fill();

        graphics.setFillStyle({ color: handHighlight, alpha: 0.6 });
        graphics.roundRect(
          segment.x - segment.width / 2 + 2,
          segment.y - segment.height / 2 + 2,
          segment.width * 0.7,
          segment.height * 0.5,
          8
        );
        graphics.fill();

        // Modern joint lines
        if (index < thumbSegments.length - 1) {
          graphics.setStrokeStyle({ color: handAccent, width: 1 });
          graphics.moveTo(
            segment.x - segment.width / 2,
            segment.y + segment.height / 2
          );
          graphics.lineTo(
            segment.x + segment.width / 2,
            segment.y + segment.height / 2
          );
          graphics.stroke();
        }
      });

      // Draw modern stylized thumb tip
      const thumbTip = thumbSegments[thumbSegments.length - 1];
      graphics.setFillStyle({ color: 0xfbbf24 }); // Golden yellow accent
      graphics.roundRect(
        thumbTip.x - thumbTip.width / 2,
        thumbTip.y - thumbTip.height / 2 + 1,
        thumbTip.width * 0.8,
        9,
        8
      );
      graphics.fill();

      graphics.setFillStyle({ color: 0xfde047, alpha: 0.8 }); // Light yellow highlight
      graphics.roundRect(
        thumbTip.x - thumbTip.width / 2 + 1,
        thumbTip.y - thumbTip.height / 2 + 2,
        thumbTip.width * 0.5,
        6,
        6
      );
      graphics.fill();

      // Draw modern hand outline (rotated 90 degrees)
      graphics.setStrokeStyle({ color: handAccent, width: 3 });
      graphics.roundRect(x - 25, y - 30, 50, 60, 15);
      graphics.stroke();

      // Add modern tech-style patterns (rotated)
      graphics.setFillStyle({ color: handGlow, alpha: 0.4 });
      for (let i = 0; i < 8; i++) {
        const dotX = x + 5 + (Math.random() - 0.5) * 25;
        const dotY = y + (Math.random() - 0.5) * 40;
        graphics.circle(dotX, dotY, 1.5);
        graphics.fill();
      }

      // Add modern accent lines (rotated)
      graphics.setStrokeStyle({ color: handGlow, alpha: 0.6, width: 1 });
      graphics.moveTo(x + 5, y - 25);
      graphics.lineTo(x + 5, y + 25);
      graphics.stroke();

      graphics.moveTo(x + 20, y - 20);
      graphics.lineTo(x + 20, y + 20);
      graphics.stroke();

      // Add enhanced animation effect - golden glow around thumb (rotated)
      graphics.setFillStyle({ color: 0xfbbf24, alpha: 0.4 });
      graphics.roundRect(x - 35, y + 25, 45, 30, 20);
      graphics.fill();

      graphics.setFillStyle({ color: 0xfbbf24, alpha: 0.2 });
      graphics.roundRect(x - 40, y + 20, 55, 40, 25);
      graphics.fill();

      // Add modern sparkle effect (rotated)
      graphics.setFillStyle({ color: 0xffffff, alpha: 0.9 });
      graphics.circle(x - 30, y + 45, 3);
      graphics.fill();
      graphics.circle(x - 15, y + 30, 2.5);
      graphics.fill();
      graphics.circle(x - 8, y + 52, 2);
      graphics.fill();

      // Add extra celebration sparkles (rotated)
      graphics.setFillStyle({ color: 0xfde047, alpha: 0.8 });
      graphics.circle(x - 25, y + 25, 2);
      graphics.fill();
      graphics.circle(x - 20, y + 50, 1.5);
      graphics.fill();
    },
    [fingerAnimationTime]
  );

  return (
    <>
      <pixiGraphics draw={drawBackground} />

      {/* Animated Hand Graphics - Base hand (hand11) or Thumbs-up (hand33) */}
      <pixiGraphics
        draw={(graphics) =>
          showLauncher
            ? drawThumbsUpHand(graphics, 300, 250)
            : drawBaseHand(graphics, 300, 250)
        }
      />

      {/* Animated Hand Graphics - Cover hand (hand22) - moves to cover/reveal coin */}
      <pixiGraphics draw={(graphics) => drawCoverHand(graphics, coverX, 250)} />

      {/* Show coin only when cover hand is not covering it (coverX > 320) and showCoin is true and no result is showing */}
      {showCoin && coverX > 320 && !result && <pixiGraphics draw={drawCoin} />}

      {/* Show result coin when flipping is done */}
      {result && (
        <>
          <pixiGraphics draw={(graphics) => drawResultCoin(graphics, result)} />
          <pixiText
            text={result.toUpperCase()}
            x={300}
            y={320}
            anchor={0.5}
            style={{
              fontSize: 28,
              fill: result === "heads" ? 0xffd700 : 0xff6b6b,
              stroke: 0x000000,
              strokeThickness: 4,
              fontWeight: "bold",
              dropShadow: true,
              dropShadowColor: 0x000000,
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 4,
              dropShadowDistance: 2,
            }}
          />
        </>
      )}
    </>
  );
};

const AdvancedModernStylizedHandGraphicsCoinGame = () => {
  const [coinRotation, setCoinRotation] = useState(0);
  const [coinScale, setCoinScale] = useState(1);
  const [coinY, setCoinY] = useState(250);
  const [coinX, setCoinX] = useState(300);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [showCoin, setShowCoin] = useState(true);
  const [coverX, setCoverX] = useState(600);
  const [coverMoving, setCoverMoving] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const [showResultEnabled, setShowResultEnabled] = useState(false);
  const [tryAgainEnabled, setTryAgainEnabled] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [slowFlipRotation, setSlowFlipRotation] = useState(0);
  const [particles, setParticles] = useState([]);

  // Move cover to hide coin after 3 seconds
  useEffect(() => {
    if (coverX === 600 && !coverMoving && !isFlipping) {
      const timer = setTimeout(() => {
        setCoverMoving(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [coverX, coverMoving, isFlipping]);

  const flipCoin = useCallback(() => {
    if (isFlipping) return;
    setShowCoin(true);
    setIsFlipping(true);
    setResult(null);
  }, [isFlipping]);

  const testCoverMovement = useCallback(() => {
    setCoverMoving(true);
  }, []);

  const showResult = useCallback(() => {
    if (!showResultEnabled || !coinResult) return;

    setCoverX(500);
    setResult(coinResult);
    setShowCoin(true);
    setScore((prev) => prev + 1);
    setShowResultEnabled(false);
  }, [showResultEnabled, coinResult]);

  const tryAgain = useCallback(() => {
    if (!tryAgainEnabled) return;

    setResult(null);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(250);
    setCoinX(300);
    setCoinResult(null);
    setShowResultEnabled(false);
    setTryAgainEnabled(false);
    setShowLauncher(false);
    setSlowFlipRotation(0);

    setCoverX(600);
    setCoverMoving(false);

    setTimeout(() => {
      setCoverMoving(true);
    }, 1000);
  }, [tryAgainEnabled]);

  const resetGame = useCallback(() => {
    setScore(0);
    setHeadsCount(0);
    setTailsCount(0);
    setResult(null);
    setIsFlipping(false);
    setCoinRotation(0);
    setCoinScale(1);
    setCoinY(250);
    setCoinX(300);
    setShowCoin(true);
    setCoverX(600);
    setCoverMoving(false);
    setShowLauncher(false);
    setShowResultEnabled(false);
    setTryAgainEnabled(false);
    setCoinResult(null);
    setSlowFlipRotation(0);
  }, []);

  // Update heads/tails count when result changes
  useEffect(() => {
    if (result === "heads") {
      setHeadsCount((prev) => prev + 1);
    } else if (result === "tails") {
      setTailsCount((prev) => prev + 1);
    }
  }, [result]);

  // Particle system functions
  const createParticle = useCallback((x, y, type = "sparkle") => {
    const particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4,
      type,
      color:
        type === "gold" ? 0xffd700 : type === "silver" ? 0xc0c0c0 : 0xffffff,
      alpha: 0.8 + Math.random() * 0.2,
    };
    return particle;
  }, []);

  const updateParticles = useCallback(() => {
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - particle.decay,
          alpha: particle.alpha * (particle.life / 1.0),
          size: particle.size * (particle.life / 1.0),
        }))
        .filter((particle) => particle.life > 0)
    );
  }, []);

  // Update particle system
  useEffect(() => {
    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, [updateParticles]);

  const drawBackground = useCallback(
    (graphics) => {
      graphics.clear();

      // Gradient background
      graphics.setFillStyle({ color: 0x0f0f23 });
      graphics.rect(0, 0, 600, 400);
      graphics.fill();

      graphics.setFillStyle({ color: 0x1a1a2e });
      graphics.rect(0, 0, 600, 200);
      graphics.fill();

      // Decorative border
      graphics.setStrokeStyle({ color: 0xffd700, width: 6 });
      graphics.rect(5, 5, 590, 390);
      graphics.stroke();

      graphics.setStrokeStyle({ color: 0x3a3a5e, width: 4 });
      graphics.rect(10, 10, 580, 380);
      graphics.stroke();

      // Corner decorations
      graphics.setFillStyle({ color: 0xffd700, alpha: 0.3 });
      const corners = [
        [20, 20],
        [580, 20],
        [20, 380],
        [580, 380],
      ];
      corners.forEach(([x, y]) => {
        graphics.circle(x, y, 8);
        graphics.fill();
      });

      // Draw particles
      particles.forEach((particle) => {
        graphics.setFillStyle({
          color: particle.color,
          alpha: Math.max(0, Math.min(1, particle.alpha)),
        });
        graphics.circle(particle.x, particle.y, particle.size);
        graphics.fill();
      });
    },
    [particles]
  );

  const drawCoin = useCallback(
    (graphics) => {
      graphics.clear();

      const currentRotation = coverX === 600 ? slowFlipRotation : coinRotation;
      const perspective = Math.abs(Math.sin(currentRotation));
      const coinRadius = 35 * coinScale;
      const ellipseHeight = coinRadius * (1 - perspective * 0.7);

      // Draw coin shadow
      graphics.setFillStyle({
        color: 0x000000,
        alpha: 0.3 + perspective * 0.2,
      });
      graphics.ellipse(
        coinX + 2,
        coinY + 5,
        coinRadius * 0.8,
        ellipseHeight * 0.6
      );
      graphics.fill();

      // Draw coin edge
      graphics.setFillStyle({ color: 0xffb000 });
      graphics.ellipse(coinX, coinY, coinRadius, ellipseHeight);
      graphics.fill();

      // Draw coin face
      const gradient = perspective < 0.3 ? 0xffd700 : 0xffed4e;
      graphics.setFillStyle({ color: gradient });
      graphics.ellipse(coinX, coinY, coinRadius * 0.9, ellipseHeight * 0.9);
      graphics.fill();

      // Draw coin face based on rotation
      const face = Math.floor(currentRotation / Math.PI) % 2;
      graphics.setFillStyle({ color: 0x000000 });

      if (face === 0) {
        // Heads - crown
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const crownScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 12 * crownScale);
        graphics.lineTo(coinX - 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX - 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX - 4 * crownScale, coinY);
        graphics.lineTo(coinX + 4 * crownScale, coinY);
        graphics.lineTo(coinX + 12 * crownScale, coinY + 4 * crownScale);
        graphics.lineTo(coinX + 8 * crownScale, coinY - 4 * crownScale);
        graphics.lineTo(coinX, coinY - 12 * crownScale);
        graphics.stroke();
      } else {
        // Tails - T
        graphics.setStrokeStyle({ color: 0x000000, width: 2 + perspective });
        const tScale = 1 - perspective * 0.5;
        graphics.moveTo(coinX, coinY - 12 * tScale);
        graphics.lineTo(coinX, coinY + 12 * tScale);
        graphics.moveTo(coinX - 12 * tScale, coinY);
        graphics.lineTo(coinX + 12 * tScale, coinY);
        graphics.stroke();
      }

      // Highlight
      if (perspective < 0.5) {
        graphics.setFillStyle({ color: 0xffffff, alpha: 0.6 });
        graphics.ellipse(
          coinX - 8,
          coinY - 8,
          coinRadius * 0.3,
          ellipseHeight * 0.3
        );
        graphics.fill();
      }
    },
    [coinRotation, coinScale, coinY, coinX, slowFlipRotation, coverX]
  );

  const drawResultCoin = useCallback((graphics, coinResult) => {
    graphics.clear();

    const coinX = 300;
    const coinY = 250;
    const coinRadius = 30;

    // Draw coin shadow
    graphics.setFillStyle({ color: 0x000000, alpha: 0.4 });
    graphics.circle(coinX + 2, coinY + 3, coinRadius * 0.9);
    graphics.fill();

    // Draw coin edge
    graphics.setFillStyle({ color: 0xffb000 });
    graphics.circle(coinX, coinY, coinRadius);
    graphics.fill();

    // Draw coin face
    graphics.setFillStyle({ color: 0xffd700 });
    graphics.circle(coinX, coinY, coinRadius * 0.9);
    graphics.fill();

    // Draw coin face based on result
    graphics.setFillStyle({ color: 0x000000 });
    graphics.setStrokeStyle({ color: 0x000000, width: 3 });

    if (coinResult === "heads") {
      // Crown symbol
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX - 6, coinY - 3);
      graphics.lineTo(coinX - 10, coinY + 3);
      graphics.lineTo(coinX - 3, coinY + 1);
      graphics.lineTo(coinX + 3, coinY + 1);
      graphics.lineTo(coinX + 10, coinY + 3);
      graphics.lineTo(coinX + 6, coinY - 3);
      graphics.lineTo(coinX, coinY - 10);
      graphics.stroke();
    } else {
      // T symbol
      graphics.moveTo(coinX, coinY - 10);
      graphics.lineTo(coinX, coinY + 10);
      graphics.moveTo(coinX - 10, coinY);
      graphics.lineTo(coinX + 10, coinY);
      graphics.stroke();
    }

    // Highlight
    graphics.setFillStyle({ color: 0xffffff, alpha: 0.7 });
    graphics.circle(coinX - 6, coinY - 6, coinRadius * 0.3);
    graphics.fill();
  }, []);

  return (
    <>
      <h1>Modern Stylized Hand Graphics Coin Game</h1>
      <div style={{ marginBottom: "10px" }}>
        <span>Total Flips: {score}</span>
        <span style={{ marginLeft: "20px" }}>Heads: {headsCount}</span>
        <span style={{ marginLeft: "20px" }}>Tails: {tailsCount}</span>
        <span style={{ marginLeft: "20px" }}>
          {!isFlipping && !result && "Click the coin to flip!"}
          {isFlipping && "Flipping..."}
          {result && `Result: ${result.toUpperCase()}!`}
        </span>
        <button
          onClick={flipCoin}
          disabled={isFlipping}
          style={{
            marginLeft: "20px",
            padding: "8px 15px",
            backgroundColor: isFlipping ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isFlipping ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </button>
        <button
          onClick={resetGame}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Reset
        </button>
        <button
          onClick={testCoverMovement}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Test Cover
        </button>
        <button
          onClick={showResult}
          disabled={!showResultEnabled}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            backgroundColor: showResultEnabled ? "#2196f3" : "#cccccc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: showResultEnabled ? "pointer" : "not-allowed",
            fontSize: "14px",
            fontWeight: "bold",
            opacity: showResultEnabled ? 1 : 0.6,
          }}
        >
          Show Result
        </button>
        <button
          onClick={tryAgain}
          disabled={!tryAgainEnabled}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            backgroundColor: tryAgainEnabled ? "#4caf50" : "#cccccc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: tryAgainEnabled ? "pointer" : "not-allowed",
            fontSize: "14px",
            fontWeight: "bold",
            opacity: tryAgainEnabled ? 1 : 0.6,
          }}
        >
          Try Again
        </button>
      </div>
      <Application
        width={600}
        height={400}
        eventMode="static"
        onClick={flipCoin}
        style={{ outline: "none", cursor: "pointer" }}
      >
        <GraphicsCoinChild
          coinRotation={coinRotation}
          isFlipping={isFlipping}
          result={result}
          setCoinRotation={setCoinRotation}
          setCoinScale={setCoinScale}
          setCoinY={setCoinY}
          setCoinX={setCoinX}
          setIsFlipping={setIsFlipping}
          drawCoin={drawCoin}
          drawBackground={drawBackground}
          drawResultCoin={drawResultCoin}
          showCoin={showCoin}
          coverX={coverX}
          setCoverX={setCoverX}
          coverMoving={coverMoving}
          setCoverMoving={setCoverMoving}
          showLauncher={showLauncher}
          setShowLauncher={setShowLauncher}
          setCoinResult={setCoinResult}
          setShowResultEnabled={setShowResultEnabled}
          setTryAgainEnabled={setTryAgainEnabled}
          setSlowFlipRotation={setSlowFlipRotation}
          setShowCoin={setShowCoin}
          createParticle={createParticle}
          setParticles={setParticles}
        />
      </Application>
    </>
  );
};

export default AdvancedModernStylizedHandGraphicsCoinGame;
