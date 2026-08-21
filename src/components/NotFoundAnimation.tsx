"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface FallingBlock {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  vAngle: number;
  color: string;
}

interface StoredBlock {
  relX: number;
  relY: number;
  size: number;
  angle: number;
  color: string;
}

interface ExhaustPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export default function NotFoundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isDestroyed = false;

    const VIRTUAL_WIDTH = 960;
    const VIRTUAL_HEIGHT = 600;

    canvas.width = VIRTUAL_WIDTH * 2;
    canvas.height = VIRTUAL_HEIGHT * 2;

    let fallingBlocks: FallingBlock[] = [];
    let storedBlocks: StoredBlock[] = [];
    let exhaustPuffs: ExhaustPuff[] = [];
    let blockIdCounter = 0;

    let lastSpawnTime = 0;
    const spawnInterval = 35; // Continuous cascade of falling voxels

    // Matching geometry angle
    const fourTiltAngle = -0.16;
    const fourAnchorX = 545;
    const fourAnchorY = 220;

    // Stem crumbling spawn points
    const spawnPoints = [
      { x: 38, y: 70 },
      { x: 50, y: 64 },
      { x: 64, y: 58 },
      { x: 42, y: 84 },
      { x: 56, y: 78 },
      { x: 70, y: 72 },
      { x: 45, y: 98 },
      { x: 60, y: 92 },
      { x: 52, y: 112 },
      { x: 68, y: 106 },
      { x: 58, y: 125 },
    ];

    // Truck state (Facing LEFT)
    const truckHomeX = 575;
    const truckHomeY = 465;
    let truckX = truckHomeX;
    let truckY = truckHomeY;
    let truckVx = 0;
    let truckSuspensionDy = 0;
    let truckSuspensionVy = 0;
    let truckBedTilt = -0.25;
    let truckState: "loading" | "driving_left" | "entering_from_right" = "loading";
    let truckWaitTimer = 0;

    // Crane coordinates
    const craneMastX = 760;
    const craneMastY = 460;
    const craneBoomY = 28;

    // Ambient floating doodles
    const stars = [
      { x: 75, y: 65, size: 9, color: "#FBBF24", rot: 0, vRot: 0.008 },
      { x: 170, y: 150, size: 7, color: "#38BDF8", rot: 0.2, vRot: -0.012 },
      { x: 95, y: 460, size: 7, color: "#F472B6", rot: 0.5, vRot: 0.009 },
      { x: 385, y: 68, size: 8, color: "#A78BFA", rot: 0.1, vRot: 0.01 },
      { x: 880, y: 185, size: 8, color: "#FBBF24", rot: 0.4, vRot: -0.008 },
      { x: 915, y: 415, size: 7, color: "#38BDF8", rot: 0.6, vRot: 0.012 },
    ];

    const seedTruckBlocks = () => {
      storedBlocks = [
        { relX: -12, relY: 2, size: 11, angle: 0.1, color: "#232836" },
        { relX: 2, relY: -2, size: 10, angle: -0.15, color: "#181B24" },
        { relX: 16, relY: -6, size: 12, angle: 0.2, color: "#232836" },
        { relX: 28, relY: -10, size: 10, angle: -0.08, color: "#181B24" },
        { relX: -4, relY: -10, size: 11, angle: 0.25, color: "#2B313F" },
        { relX: 10, relY: -15, size: 10, angle: -0.2, color: "#232836" },
        { relX: 22, relY: -18, size: 9, angle: 0.1, color: "#181B24" },
      ];
    };
    seedTruckBlocks();

    // Spawn falling block
    const spawnFallingBlock = (time: number) => {
      const isDark = document.documentElement.classList.contains("dark");
      const swayAngle = Math.sin(time * 0.0018) * 0.035 + fourTiltAngle;

      const spot = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      const cosS = Math.cos(swayAngle);
      const sinS = Math.sin(swayAngle);

      const spawnX = fourAnchorX + (spot.x * cosS - spot.y * sinS) + (Math.random() - 0.5) * 8;
      const spawnY = fourAnchorY + (spot.x * sinS + spot.y * cosS) + (Math.random() - 0.5) * 8;

      const size = 8.5 + Math.random() * 6;
      const blockColor = isDark
        ? Math.random() > 0.35
          ? "#E2E8F0"
          : "#CBD5E1"
        : Math.random() > 0.35
        ? "#232836"
        : "#181B24";

      const targetBedX = truckHomeX + 22 + (Math.random() - 0.5) * 32;
      const dx = targetBedX - spawnX;

      fallingBlocks.push({
        id: ++blockIdCounter,
        x: spawnX,
        y: spawnY,
        vx: dx * 0.02 + (Math.random() - 0.5) * 0.8,
        vy: 1.0 + Math.random() * 1.0,
        size,
        angle: (Math.random() - 0.5) * 0.8,
        vAngle: (Math.random() - 0.5) * 0.08,
        color: blockColor,
      });
    };

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      if (isDestroyed) return;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const isDark = document.documentElement.classList.contains("dark");

      const colors = {
        textPrimary: isDark ? "#F8FAFC" : "#282D3C",
        textShadow: isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(232, 235, 242, 0.95)",
        craneYellow: "#FBBF24",
        craneYellowDark: "#D97706",
        craneBlue: isDark ? "#38BDF8" : "#00C4EE",
        craneBlueDark: isDark ? "#0284C7" : "#0096C7",
        craneSteel: isDark ? "#64748B" : "#525B6A",
        craneTrack: isDark ? "#334155" : "#374151",
        cable: isDark ? "#94A3B8" : "#4B5563",
        truckBedDark: isDark ? "#1E293B" : "#232836",
        wheelHub: "#FBBF24",
      };

      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // -----------------------------------------------------------
      // 1. AMBIENT BACKGROUND DOODLES
      // -----------------------------------------------------------
      stars.forEach((star) => {
        star.rot += star.vRot;
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rot);
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        const half = star.size / 2;
        ctx.beginPath();
        ctx.moveTo(-half, 0);
        ctx.lineTo(half, 0);
        ctx.moveTo(0, -half);
        ctx.lineTo(0, half);
        ctx.stroke();
        ctx.restore();
      });

      // Rocket Doodle
      ctx.save();
      ctx.translate(180, 80 + Math.sin(currentTime * 0.002) * 6);
      ctx.rotate(-0.5 + Math.sin(currentTime * 0.002) * 0.05);
      ctx.strokeStyle = isDark ? "#38BDF8" : "#00C4EE";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.bezierCurveTo(9, -7, 9, 9, 0, 15);
      ctx.bezierCurveTo(-9, 9, -9, -7, 0, -14);
      ctx.moveTo(3, 0);
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.moveTo(-7, 7);
      ctx.lineTo(-13, 14);
      ctx.lineTo(-7, 13);
      ctx.moveTo(7, 7);
      ctx.lineTo(13, 14);
      ctx.lineTo(7, 13);
      ctx.moveTo(-2.5, 15);
      ctx.lineTo(0, 20);
      ctx.lineTo(2.5, 15);
      ctx.stroke();
      ctx.restore();

      // Ambient dots
      const dotCoords = [
        [110, 230],
        [320, 110],
        [430, 290],
        [690, 130],
        [830, 85],
        [880, 270],
      ];
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)";
      dotCoords.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // -----------------------------------------------------------
      // 2. CRANE TOWER & TOP BOOM
      // -----------------------------------------------------------
      const boomStartX = 460;
      const boomEndX = 890;
      const boomY = craneBoomY;
      const boomHeight = 24;

      ctx.strokeStyle = colors.craneSteel;
      ctx.lineWidth = 2.5;

      const mastWidth = 44;
      const mastTopY = boomY + boomHeight;
      const mastBottomY = craneMastY;

      // Mast Rails
      ctx.beginPath();
      ctx.moveTo(craneMastX - mastWidth / 2, mastTopY);
      ctx.lineTo(craneMastX - mastWidth / 2, mastBottomY);
      ctx.moveTo(craneMastX + mastWidth / 2, mastTopY);
      ctx.lineTo(craneMastX + mastWidth / 2, mastBottomY);
      ctx.stroke();

      // Mast X-braces
      const mastSteps = 8;
      const stepH = (mastBottomY - mastTopY) / mastSteps;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < mastSteps; i++) {
        const y1 = mastTopY + i * stepH;
        const y2 = y1 + stepH;
        ctx.moveTo(craneMastX - mastWidth / 2, y1);
        ctx.lineTo(craneMastX + mastWidth / 2, y2);
        ctx.moveTo(craneMastX + mastWidth / 2, y1);
        ctx.lineTo(craneMastX - mastWidth / 2, y2);
        ctx.moveTo(craneMastX - mastWidth / 2, y2);
        ctx.lineTo(craneMastX + mastWidth / 2, y2);
      }
      ctx.stroke();

      // Horizontal Boom
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(boomStartX, boomY);
      ctx.lineTo(boomEndX, boomY);
      ctx.moveTo(boomStartX, boomY + boomHeight);
      ctx.lineTo(boomEndX, boomY + boomHeight);
      ctx.lineTo(boomEndX, boomY);
      ctx.lineTo(boomStartX, boomY);
      ctx.stroke();

      // Boom X-braces
      const boomSteps = 16;
      const boomStepW = (boomEndX - boomStartX) / boomSteps;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < boomSteps; i++) {
        const bx1 = boomStartX + i * boomStepW;
        const bx2 = bx1 + boomStepW;
        ctx.moveTo(bx1, boomY);
        ctx.lineTo(bx2, boomY + boomHeight);
        ctx.moveTo(bx2, boomY);
        ctx.lineTo(bx1, boomY + boomHeight);
        ctx.moveTo(bx2, boomY);
        ctx.lineTo(bx2, boomY + boomHeight);
      }
      ctx.stroke();

      // Counterweight
      ctx.fillStyle = isDark ? "#475569" : "#6B7280";
      ctx.fillRect(boomEndX - 44, boomY - 14, 42, 34);
      ctx.fillStyle = isDark ? "#64748B" : "#9CA3AF";
      ctx.fillRect(boomEndX - 42, boomY - 12, 38, 10);

      // Crane Trolley
      const trolleyX = fourAnchorX - 10;
      const trolleyY = boomY + boomHeight;
      ctx.fillStyle = isDark ? "#334155" : "#1F2937";
      ctx.fillRect(trolleyX - 12, trolleyY - 2, 24, 10);

      // Sway
      const totalSway = Math.sin(currentTime * 0.0018) * 0.035 + fourTiltAngle;
      const fourTopHookX = fourAnchorX + Math.sin(totalSway) * 4;
      const fourTopHookY = fourAnchorY - 122;

      // Cable
      ctx.strokeStyle = colors.cable;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(trolleyX, trolleyY + 8);
      ctx.lineTo(fourTopHookX, fourTopHookY);
      ctx.stroke();

      // -----------------------------------------------------------
      // 3. STATIC "4 0" (Left '4' & middle '0') WITH 3D DROP SHADOW
      // -----------------------------------------------------------
      const shadowOffsetX = -28;
      const shadowOffsetY = 28;

      // Classic, clean bold typography contour for digit '4'
      const drawDigit4Path = (fillColor: string, stemCutoffY = 125) => {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        // Top flat edge of stem
        ctx.moveTo(34, -125);
        ctx.lineTo(82, -125);
        // Vertical right edge of stem down to crossbar
        ctx.lineTo(82, 28);
        // Right extension of crossbar
        ctx.lineTo(104, 28);
        ctx.lineTo(104, 65);
        ctx.lineTo(82, 65);
        // Lower stem
        if (stemCutoffY < 125) {
          ctx.lineTo(82, stemCutoffY - 6);
          ctx.lineTo(74, stemCutoffY + 2);
          ctx.lineTo(62, stemCutoffY - 4);
          ctx.lineTo(50, stemCutoffY + 4);
          ctx.lineTo(34, stemCutoffY - 4);
        } else {
          ctx.lineTo(82, 125);
          ctx.lineTo(34, 125);
        }
        // Left side of lower stem up to crossbar
        ctx.lineTo(34, 65);
        // Crossbar bottom-left corner
        ctx.lineTo(-76, 65);
        ctx.lineTo(-76, 28);
        // Diagonal outer edge up towards top of stem
        ctx.lineTo(34, -85);
        ctx.closePath();

        // Inner triangular cutout
        ctx.moveTo(34, -38);
        ctx.lineTo(-20, 28);
        ctx.lineTo(34, 28);
        ctx.closePath();
        ctx.fill("evenodd");
      };

      const drawLeft4 = (offsetX: number, offsetY: number, fillColor: string) => {
        ctx.save();
        ctx.translate(230 + offsetX, 235 + offsetY);
        ctx.rotate(fourTiltAngle);
        drawDigit4Path(fillColor, 125);
        ctx.restore();
      };

      const drawMiddle0 = (offsetX: number, offsetY: number, fillColor: string) => {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        const zX = 405 + offsetX;
        const zY = 230 + offsetY;
        ctx.ellipse(zX, zY, 58, 120, -0.15, 0, Math.PI * 2);
        ctx.ellipse(zX, zY, 22, 68, -0.15, 0, Math.PI * 2, true);
        ctx.fill("evenodd");
      };

      // Draw 3D shadows for '40'
      drawLeft4(shadowOffsetX, shadowOffsetY, colors.textShadow);
      drawMiddle0(shadowOffsetX, shadowOffsetY, colors.textShadow);

      // Draw foreground '40'
      drawLeft4(0, 0, colors.textPrimary);
      drawMiddle0(0, 0, colors.textPrimary);

      // -----------------------------------------------------------
      // 4. SUSPENDED RIGHT "4" (IDENTICAL GEOMETRY WITH CRUMBLING STEM)
      // -----------------------------------------------------------
      const drawSuspended4 = (offsetX: number, offsetY: number, fillColor: string) => {
        ctx.save();
        ctx.translate(fourAnchorX + offsetX, fourAnchorY + offsetY);
        ctx.rotate(totalSway);

        // Draw solid upper body with stem cut at y = 65
        drawDigit4Path(fillColor, 65);

        // Attached voxel clusters at the crumbling bottom of the stem
        const attachedVoxels = [
          { x: 34, y: 68, s: 12 },
          { x: 48, y: 64, s: 10 },
          { x: 62, y: 60, s: 11 },
          { x: 38, y: 80, s: 12 },
          { x: 52, y: 74, s: 11 },
          { x: 66, y: 70, s: 10 },
          { x: 42, y: 92, s: 11 },
          { x: 56, y: 86, s: 10 },
          { x: 50, y: 104, s: 10 },
          { x: 62, y: 98, s: 9 },
          { x: 54, y: 116, s: 10 },
        ];
        attachedVoxels.forEach((v) => {
          ctx.fillRect(v.x, v.y, v.s, v.s);
        });

        ctx.restore();
      };

      // 3D Shadow and Foreground for suspended '4'
      drawSuspended4(shadowOffsetX * 0.8, shadowOffsetY * 0.8, colors.textShadow);
      drawSuspended4(0, 0, colors.textPrimary);

      // Spawn falling blocks continuously
      if (currentTime - lastSpawnTime > spawnInterval) {
        lastSpawnTime = currentTime;
        spawnFallingBlock(currentTime);
      }

      // -----------------------------------------------------------
      // 5. TRUCK CYCLE: DRIVES LEFT, RE-ENTERS FROM RIGHT
      // -----------------------------------------------------------
      if (truckState === "loading") {
        truckX = truckHomeX;
        truckY = truckHomeY;
        truckBedTilt = -0.25;

        // When truck accumulates ~24 blocks, drive off to the LEFT!
        if (storedBlocks.length >= 24) {
          truckWaitTimer += dt;
          if (truckWaitTimer > 0.5) {
            truckState = "driving_left";
            truckVx = -60;
            truckWaitTimer = 0;
          }
        }
      } else if (truckState === "driving_left") {
        truckVx -= 500 * dt;
        truckX += truckVx * dt;
        truckBedTilt = Math.max(-0.48, truckBedTilt - 0.25 * dt);

        if (Math.random() > 0.25) {
          exhaustPuffs.push({
            x: truckX + 48,
            y: truckY + 18,
            vx: 35 + Math.random() * 30,
            vy: -10 - Math.random() * 15,
            radius: 4 + Math.random() * 5,
            alpha: 0.6,
          });
        }

        // Once off the LEFT side of the screen
        if (truckX < -170) {
          truckState = "entering_from_right";
          truckX = VIRTUAL_WIDTH + 140; // enter from right
          truckVx = -380;
          truckBedTilt = -0.25;
          storedBlocks = []; // empty load!
        }
      } else if (truckState === "entering_from_right") {
        const dist = truckX - truckHomeX;
        if (dist > 0) {
          truckX += Math.min(-90, -dist * 3.4) * dt;
          if (truckX <= truckHomeX + 2) {
            truckX = truckHomeX;
            truckVx = 0;
            truckState = "loading";
            truckSuspensionDy = 4;
            seedTruckBlocks();
          }
        }
      }

      truckSuspensionVy += -18 * truckSuspensionDy * dt - 6 * truckSuspensionVy * dt;
      truckSuspensionDy += truckSuspensionVy * dt;

      // -----------------------------------------------------------
      // 6. CASCADE OF FALLING BLOCKS & TRUCK BED COLLECTION
      // -----------------------------------------------------------
      const bedPivotX = truckX + 12;
      const bedPivotY = truckY + 10 + truckSuspensionDy;

      for (let i = fallingBlocks.length - 1; i >= 0; i--) {
        const block = fallingBlocks[i];
        block.vy += 380 * dt;
        block.vx *= 0.99;
        block.x += block.vx * dt * 60;
        block.y += block.vy * dt * 60;
        block.angle += block.vAngle;

        // Catch into truck bed
        if (truckState === "loading") {
          const dx = block.x - bedPivotX;
          const dy = block.y - bedPivotY;

          // Bed collection area: inside the tilted yellow bed
          if (dx >= -24 && dx <= 52 && dy >= -22 && dy <= 16 && block.vy > 0) {
            storedBlocks.push({
              relX: dx,
              relY: Math.max(-14, Math.min(8, dy)),
              size: block.size,
              angle: block.angle,
              color: block.color,
            });

            truckSuspensionVy += 1.2;
            fallingBlocks.splice(i, 1);
            continue;
          }
        }

        if (block.y > VIRTUAL_HEIGHT + 60) {
          fallingBlocks.splice(i, 1);
          continue;
        }

        // Draw falling block
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.angle);
        ctx.fillStyle = block.color;
        ctx.fillRect(-block.size / 2, -block.size / 2, block.size, block.size);
        ctx.strokeStyle = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-block.size / 2, -block.size / 2, block.size, block.size);
        ctx.restore();
      }

      // -----------------------------------------------------------
      // 7. DRAW DUMP TRUCK (FACING LEFT - EXACT MATCH TO REFERENCE)
      // -----------------------------------------------------------
      ctx.save();
      ctx.translate(truckX, truckY + truckSuspensionDy);

      // --- 7a. Tilted Yellow Dumper Bed (Right of cab, angled UP to right) ---
      ctx.save();
      ctx.translate(14, 10);
      ctx.rotate(truckBedTilt);

      // Yellow Bed Outer Frame
      ctx.fillStyle = colors.craneYellow;
      ctx.beginPath();
      ctx.moveTo(-36, 6);
      ctx.lineTo(44, 6);
      ctx.lineTo(48, -26);
      ctx.lineTo(-34, -26);
      ctx.closePath();
      ctx.fill();

      // Bed Top Lip
      ctx.fillStyle = colors.craneYellowDark;
      ctx.fillRect(-34, -26, 82, 5);

      // Bed Dark Interior Cavity
      ctx.fillStyle = colors.truckBedDark;
      ctx.beginPath();
      ctx.moveTo(-30, 2);
      ctx.lineTo(40, 2);
      ctx.lineTo(44, -21);
      ctx.lineTo(-28, -21);
      ctx.closePath();
      ctx.fill();

      // Render stored blocks stacked inside the bed!
      storedBlocks.forEach((sb) => {
        ctx.save();
        ctx.translate(sb.relX - 14, sb.relY);
        ctx.rotate(sb.angle);
        ctx.fillStyle = sb.color;
        ctx.fillRect(-sb.size / 2, -sb.size / 2, sb.size, sb.size);
        ctx.strokeStyle = isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-sb.size / 2, -sb.size / 2, sb.size, sb.size);
        ctx.restore();
      });

      ctx.restore(); // End Bed

      // --- 7b. Yellow Driver Cab (Facing Left) ---
      ctx.fillStyle = colors.craneYellow;
      ctx.beginPath();
      ctx.roundRect(-58, -24, 44, 46, [6, 2, 2, 2]);
      ctx.fill();

      // Cab Roof Lip
      ctx.fillStyle = colors.craneYellowDark;
      ctx.fillRect(-58, -24, 44, 4);

      // Windshield
      ctx.fillStyle = isDark ? "#0284C7" : "#E0F2FE";
      ctx.beginPath();
      ctx.roundRect(-54, -18, 18, 18, [3, 2, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = isDark ? "#0369A1" : "#7DD3FC";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mirror
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(-57, -10, 3, 10);

      // Headlight & Bumper
      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(-59, 6, 4, 8);
      ctx.fillStyle = "#374151";
      ctx.fillRect(-60, 16, 10, 8);

      // Undercarriage Chassis
      ctx.fillStyle = "#1F2937";
      ctx.fillRect(-52, 20, 110, 8);

      // --- 7c. 3 Heavy Duty Wheels ---
      const wheelPositions = [-40, 14, 44];
      wheelPositions.forEach((wx) => {
        // Black Tire
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.arc(wx, 28, 12, 0, Math.PI * 2);
        ctx.fill();

        // Yellow Rim
        ctx.fillStyle = colors.craneYellow;
        ctx.beginPath();
        ctx.arc(wx, 28, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // White/Silver Center Hub
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.arc(wx, 28, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Wheel rotation when moving
        if (truckState !== "loading") {
          ctx.strokeStyle = "#1F2937";
          ctx.lineWidth = 1.5;
          const wRot = truckX * 0.12;
          ctx.beginPath();
          ctx.moveTo(wx + Math.cos(wRot) * 10, 28 + Math.sin(wRot) * 10);
          ctx.lineTo(wx - Math.cos(wRot) * 10, 28 - Math.sin(wRot) * 10);
          ctx.stroke();
        }
      });

      ctx.restore(); // End Truck

      // -----------------------------------------------------------
      // 8. DRAW CRAWLER CRANE BASE (Cyan Machine on Right)
      // -----------------------------------------------------------
      ctx.save();
      ctx.translate(craneMastX, craneMastY);

      // Cyan Machine Cabin
      ctx.fillStyle = colors.craneBlue;
      ctx.beginPath();
      ctx.moveTo(-52, 0);
      ctx.lineTo(44, 0);
      ctx.lineTo(44, -36);
      ctx.lineTo(-12, -36);
      ctx.lineTo(-44, -14);
      ctx.lineTo(-52, 0);
      ctx.closePath();
      ctx.fill();

      // Window
      ctx.fillStyle = isDark ? "#082F49" : "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(-30, -30, 18, 22, [4, 4, 2, 2]);
      ctx.fill();

      // Roof step
      ctx.fillStyle = colors.craneBlueDark;
      ctx.fillRect(10, -34, 30, 8);

      // Track Base
      ctx.fillStyle = colors.craneTrack;
      ctx.beginPath();
      ctx.roundRect(-56, 0, 106, 18, 8);
      ctx.fill();

      // Rollers
      ctx.fillStyle = isDark ? "#64748B" : "#9CA3AF";
      const trackWheels = [-44, -26, -8, 10, 28, 42];
      trackWheels.forEach((twX) => {
        ctx.beginPath();
        ctx.arc(twX, 9, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? "#334155" : "#4B5563";
        ctx.beginPath();
        ctx.arc(twX, 9, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? "#64748B" : "#9CA3AF";
      });

      ctx.restore(); // End Crawler Base

      // -----------------------------------------------------------
      // 9. EXHAUST PUFFS
      // -----------------------------------------------------------
      for (let i = exhaustPuffs.length - 1; i >= 0; i--) {
        const ep = exhaustPuffs[i];
        ep.x += ep.vx * dt;
        ep.y += ep.vy * dt;
        ep.radius += 12 * dt;
        ep.alpha -= 0.8 * dt;
        if (ep.alpha <= 0) {
          exhaustPuffs.splice(i, 1);
          continue;
        }
        ctx.fillStyle = isDark ? "#475569" : "#D1D5DB";
        ctx.globalAlpha = Math.max(0, ep.alpha);
        ctx.beginPath();
        ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, theme, resolvedTheme]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-4 select-none">
      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[880px] aspect-[16/10] flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-default drop-shadow-xs"
        />
      </div>

      {/* Error Message & Call to Action matching reference image */}
      <div className="mt-2 flex flex-col items-center text-center max-w-lg z-10">
        <p className="text-base md:text-lg font-normal text-muted-foreground mb-6">
          It seems we couldn&apos;t find the page you&apos;re looking for.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-9 py-3 rounded-full text-sm font-semibold text-white bg-[#00C4EE] hover:bg-[#00B4D8] active:scale-[0.98] shadow-md shadow-[#00C4EE]/25 hover:shadow-[#00C4EE]/40 transition-all duration-200"
        >
          Go Home !
        </Link>
      </div>
    </div>
  );
}
