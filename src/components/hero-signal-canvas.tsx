"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "./theme-provider";

interface HeroSignalCanvasProps {
  pointerRef: React.RefObject<{ x: number; y: number; active: boolean }>;
  alignRef?: React.RefObject<HTMLElement | null>;
  excludeRef?: React.RefObject<HTMLElement | null>;
}

interface ExcludeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface GridPoint {
  col: number;
  row: number;
}

interface SnakeAgent {
  id: number;
  nodes: GridPoint[];
  dir: { dc: number; dr: number };
  progress: number;
  speedCellsPerSec: number;
  growing: number;
  opacity: number;
}

interface FoodPellet {
  col: number;
  row: number;
  phase: number;
}

interface EatBurst {
  x: number;
  y: number;
  bornAt: number;
}

interface ClickRipple {
  x: number;
  y: number;
  bornAt: number;
}

const CARDINAL_DIRS = [
  { dc: 1, dr: 0 },
  { dc: -1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: 0, dr: -1 },
] as const;

export function HeroSignalCanvas({
  pointerRef,
  alignRef,
  excludeRef,
}: HeroSignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, mounted } = useTheme();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = mounted && theme === "dark";
    const cellSize = 48; // Matches Linktree h-12 (48px) row height
    let width = 0;
    let height = 0;
    let originX = 0.5;
    let originY = 0.5;
    let minCol = 0;
    let maxCol = 0;
    let minRow = 0;
    let maxRow = 0;
    let excludeRect: ExcludeRect | null = null;
    let snakes: SnakeAgent[] = [];
    let foods: FoodPellet[] = [];
    const bursts: EatBurst[] = [];
    const ripples: ClickRipple[] = [];
    let nextSnakeId = 1;
    let rafId = 0;
    let lastTime = performance.now();

    const toPxX = (col: number) => originX + col * cellSize;
    const toPxY = (row: number) => originY + row * cellSize;

    const measureAlignment = () => {
      const cRect = canvas.getBoundingClientRect();
      const target = alignRef?.current;
      if (target) {
        const tRect = target.getBoundingClientRect();
        originX = Math.round(tRect.left - cRect.left) + 0.5;
        originY = Math.round(tRect.top - cRect.top) + 0.5;
      } else {
        originX = 0.5;
        originY = 0.5;
      }

      const exTarget = excludeRef?.current;
      if (exTarget) {
        const exRect = exTarget.getBoundingClientRect();
        if (exRect.width > 0 && exRect.height > 0) {
          excludeRect = {
            left: exRect.left - cRect.left - 8,
            top: exRect.top - cRect.top - 8,
            right: exRect.right - cRect.left + 8,
            bottom: exRect.bottom - cRect.top + 8,
          };
        } else {
          excludeRect = null;
        }
      } else {
        excludeRect = null;
      }

      minCol = Math.ceil((16 - originX) / cellSize);
      maxCol = Math.floor((width - 16 - originX) / cellSize);
      minRow = Math.ceil((16 - originY) / cellSize);
      maxRow = Math.floor((height - 16 - originY) / cellSize);
    };

    const isBlockedCell = (col: number, row: number) => {
      if (!excludeRect) return false;
      const px = toPxX(col);
      const py = toPxY(row);
      return (
        px >= excludeRect.left &&
        px <= excludeRect.right &&
        py >= excludeRect.top &&
        py <= excludeRect.bottom
      );
    };

    const spawnFood = (): FoodPellet => {
      const cSpan = Math.max(1, maxCol - minCol + 1);
      const rSpan = Math.max(1, maxRow - minRow + 1);
      let bestCol = minCol;
      let bestRow = minRow;
      let bestSpacing = -1;

      for (let attempt = 0; attempt < 36; attempt++) {
        const col = minCol + Math.floor(Math.random() * cSpan);
        const row = minRow + Math.floor(Math.random() * rSpan);
        if (isBlockedCell(col, row)) continue;

        let minSpacing = Infinity;
        for (const f of foods) {
          const d = Math.abs(f.col - col) + Math.abs(f.row - row);
          if (d < minSpacing) minSpacing = d;
        }
        for (const s of snakes) {
          const head = s.nodes[0];
          if (!head) continue;
          const d = Math.abs(head.col - col) + Math.abs(head.row - row);
          if (d < minSpacing) minSpacing = d;
        }

        if (minSpacing >= 4) {
          return { col, row, phase: Math.random() * Math.PI * 2 };
        }
        if (minSpacing > bestSpacing) {
          bestSpacing = minSpacing;
          bestCol = col;
          bestRow = row;
        }
      }
      return {
        col: bestCol,
        row: bestRow,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const makeSnake = (): SnakeAgent => {
      const cSpan = Math.max(1, maxCol - minCol - 1);
      const rSpan = Math.max(1, maxRow - minRow - 1);

      let col = minCol + 1;
      let row = minRow + 1;
      let dir: { dc: number; dr: number } = CARDINAL_DIRS[0];
      let bestHeadSpacing = -1;

      for (let attempt = 0; attempt < 48; attempt++) {
        const tc = minCol + 1 + Math.floor(Math.random() * cSpan);
        const tr = minRow + 1 + Math.floor(Math.random() * rSpan);
        const td = CARDINAL_DIRS[Math.floor(Math.random() * CARDINAL_DIRS.length)];
        const p0Blocked = isBlockedCell(tc, tr);
        const p1Blocked = isBlockedCell(tc - td.dc, tr - td.dr);
        const p2Blocked = isBlockedCell(tc - td.dc * 2, tr - td.dr * 2);
        if (p0Blocked || p1Blocked || p2Blocked) continue;

        let minHeadDist = Infinity;
        for (const other of snakes) {
          for (const node of other.nodes) {
            const d = Math.abs(node.col - tc) + Math.abs(node.row - tr);
            if (d < minHeadDist) minHeadDist = d;
          }
        }

        if (minHeadDist >= 7) {
          col = tc;
          row = tr;
          dir = td;
          break;
        }
        if (minHeadDist > bestHeadSpacing) {
          bestHeadSpacing = minHeadDist;
          col = tc;
          row = tr;
          dir = td;
        }
      }

      const initialLength = 3 + Math.floor(Math.random() * 2);

      const nodes: GridPoint[] = [];
      for (let i = 0; i < initialLength; i++) {
        const nc = Math.max(minCol, Math.min(maxCol, col - dir.dc * (i - 1)));
        const nr = Math.max(minRow, Math.min(maxRow, row - dir.dr * (i - 1)));
        nodes.push({
          col: isBlockedCell(nc, nr) ? col : nc,
          row: isBlockedCell(nc, nr) ? row : nr,
        });
      }

      return {
        id: nextSnakeId++,
        nodes,
        dir,
        progress: Math.random(),
        speedCellsPerSec: 1.05 + Math.random() * 0.6,
        growing: 0,
        opacity: 0.26 + Math.random() * 0.16,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      measureAlignment();

      const snakeCount = Math.max(4, Math.min(8, Math.floor(width / 230)));
      const foodCount = Math.max(5, Math.min(10, Math.floor(width / 190)));

      foods = [];
      snakes = [];
      for (let i = 0; i < foodCount; i++) foods.push(spawnFood());
      for (let i = 0; i < snakeCount; i++) snakes.push(makeSnake());
    };

    const handleWindowClick = (e: MouseEvent) => {
      if (prefersReduced) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        ripples.push({
          x: localX,
          y: localY,
          bornAt: performance.now(),
        });
        if (ripples.length > 4) ripples.shift();

        const snapCol = Math.max(
          minCol,
          Math.min(maxCol, Math.round((localX - originX) / cellSize))
        );
        const snapRow = Math.max(
          minRow,
          Math.min(maxRow, Math.round((localY - originY) / cellSize))
        );
        if (
          !isBlockedCell(snapCol, snapRow) &&
          !foods.some((f) => f.col === snapCol && f.row === snapRow)
        ) {
          foods.push({ col: snapCol, row: snapRow, phase: 0 });
          if (foods.length > 14) foods.shift();
        }
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (alignRef?.current) {
      observer.observe(alignRef.current);
    }
    if (excludeRef?.current) {
      observer.observe(excludeRef.current);
    }
    window.addEventListener("click", handleWindowClick);

    const chooseNextDir = (snake: SnakeAgent) => {
      const head = snake.nodes[0];

      const inBounds = (nc: number, nr: number) =>
        nc >= minCol && nc <= maxCol && nr >= minRow && nr <= maxRow;

      let candidates = CARDINAL_DIRS.filter((d) => {
        if (d.dc === -snake.dir.dc && d.dr === -snake.dir.dr) return false;
        const nc = head.col + d.dc;
        const nr = head.row + d.dr;
        return inBounds(nc, nr) && !isBlockedCell(nc, nr);
      });

      if (candidates.length === 0) {
        // Fallback: allow reversing out if trapped against wall + excludeRect
        candidates = CARDINAL_DIRS.filter((d) => {
          const nc = head.col + d.dc;
          const nr = head.row + d.dr;
          return inBounds(nc, nr) && !isBlockedCell(nc, nr);
        });
      }

      if (candidates.length === 0) {
        return { dc: -snake.dir.dc, dr: -snake.dir.dr };
      }

      const straightCandidate = candidates.find(
        (d) => d.dc === snake.dir.dc && d.dr === snake.dir.dr
      );

      // Helper: measure how crowded candidate cell (nc, nr) is with other snakes
      const crowdPenaltyAt = (nc: number, nr: number, ignorePoint?: GridPoint | null) => {
        let penalty = 0;
        for (const other of snakes) {
          if (other.id === snake.id) continue;
          for (let idx = 0; idx < other.nodes.length; idx++) {
            const seg = other.nodes[idx];
            if (ignorePoint && seg.col === ignorePoint.col && seg.row === ignorePoint.row) {
              continue;
            }
            const d = Math.abs(seg.col - nc) + Math.abs(seg.row - nr);
            if (idx === 0 && d <= 4) {
              penalty += (5 - d) * 2.1;
            } else if (d <= 2) {
              penalty += (3 - d) * 1.3;
            }
          }
        }
        return penalty;
      };

      // Limited short-range vision: snakes don't see across the whole screen
      const MAX_FOOD_SIGHT = 4;
      const MAX_PREY_SIGHT = 3;

      let target: GridPoint | null = null;
      let bestTargetCost = Infinity;

      for (const f of foods) {
        const d = Math.abs(f.col - head.col) + Math.abs(f.row - head.row);
        if (d <= MAX_FOOD_SIGHT && d < bestTargetCost) {
          bestTargetCost = d;
          target = f;
        }
      }

      // Only opportunistically notice very close enemy segments (~35% of turns)
      if (Math.random() < 0.35) {
        for (const other of snakes) {
          if (other.id === snake.id || other.nodes.length < 2) continue;
          const startIdx = snake.nodes.length >= other.nodes.length ? 0 : 1;
          for (let idx = startIdx; idx < other.nodes.length; idx++) {
            const seg = other.nodes[idx];
            const d = Math.abs(seg.col - head.col) + Math.abs(seg.row - head.row);
            if (d <= MAX_PREY_SIGHT) {
              const cost = d * 1.35;
              if (cost < bestTargetCost) {
                bestTargetCost = cost;
                target = seg;
              }
            }
          }
        }
      }

      // Clumsy / lazy cruising: if nothing nearby or distracted (~34%), wander smoothly away from crowds
      if (!target || Math.random() < 0.34) {
        if (straightCandidate && Math.random() < 0.72) {
          const snc = head.col + straightCandidate.dc;
          const snr = head.row + straightCandidate.dr;
          const hitsSelf = snake.nodes.some((n) => n.col === snc && n.row === snr);
          if (!hitsSelf && crowdPenaltyAt(snc, snr) < 3.5) {
            return straightCandidate;
          }
        }

        let wanderDir = candidates[0];
        let bestWanderScore = Infinity;
        for (const d of candidates) {
          const nc = head.col + d.dc;
          const nr = head.row + d.dr;
          const hitsSelf = snake.nodes.some((n) => n.col === nc && n.row === nr);
          const isTurn = d.dc !== snake.dir.dc || d.dr !== snake.dir.dr;
          const score =
            crowdPenaltyAt(nc, nr) +
            (hitsSelf ? 6 : 0) +
            (isTurn ? 0.6 : 0) +
            Math.random() * 1.8;
          if (score < bestWanderScore) {
            bestWanderScore = score;
            wanderDir = d;
          }
        }
        return wanderDir;
      }

      let bestDir = candidates[0];
      let bestScore = Infinity;

      for (const d of candidates) {
        const nc = head.col + d.dc;
        const nr = head.row + d.dr;
        const dist = Math.abs(target.col - nc) + Math.abs(target.row - nr);
        const hitsSelf = snake.nodes.some((n) => n.col === nc && n.row === nr);
        const hitsBiggerHead = snakes.some(
          (other) =>
            other.id !== snake.id &&
            other.nodes.length > snake.nodes.length &&
            other.nodes[0].col === nc &&
            other.nodes[0].row === nr
        );
        const score =
          dist +
          crowdPenaltyAt(nc, nr, target) * 0.75 +
          (hitsSelf ? 6 : 0) +
          (hitsBiggerHead ? 8 : 0) +
          Math.random() * 0.9;
        if (score < bestScore) {
          bestScore = score;
          bestDir = d;
        }
      }

      return bestDir;
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) * 0.001);
      lastTime = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, width, height);

      const lineRgb = isDark ? "255, 255, 255" : "24, 24, 27";
      const accentRgb = isDark ? "52, 211, 153" : "5, 150, 105";
      const pointer = pointerRef.current;

      const startCol = Math.floor(-originX / cellSize);
      const endCol = Math.ceil((width - originX) / cellSize);
      const startRow = Math.floor(-originY / cellSize);
      const endRow = Math.ceil((height - originY) / cellSize);

      // 1. Grid lines aligned directly with Linktree item boundaries
      ctx.strokeStyle = `rgba(${lineRgb}, ${isDark ? "0.05" : "0.055"})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = startCol; c <= endCol; c++) {
        const x = toPxX(c);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let r = startRow; r <= endRow; r++) {
        const y = toPxY(r);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Intersection crosshairs + cursor snap reticle
      let nearestSnap: { x: number; y: number; dist: number } | null = null;

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const x = toPxX(c);
          const y = toPxY(r);

          let proximity = 0;
          if (pointer.active && !prefersReduced) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (!nearestSnap || dist < nearestSnap.dist) {
              nearestSnap = { x, y, dist };
            }
            if (dist < 160) {
              proximity = 1 - dist / 160;
            }
          }

          if (proximity > 0.05) {
            ctx.strokeStyle = `rgba(${accentRgb}, ${(0.22 + proximity * 0.6).toFixed(3)})`;
            const arm = 3 + proximity * 4;
            ctx.beginPath();
            ctx.moveTo(x - arm, y);
            ctx.lineTo(x + arm, y);
            ctx.moveTo(x, y - arm);
            ctx.lineTo(x, y + arm);
            ctx.stroke();
          } else {
            ctx.strokeStyle = `rgba(${lineRgb}, ${isDark ? "0.12" : "0.13"})`;
            ctx.beginPath();
            ctx.moveTo(x - 2.5, y);
            ctx.lineTo(x + 2.5, y);
            ctx.moveTo(x, y - 2.5);
            ctx.lineTo(x, y + 2.5);
            ctx.stroke();
          }
        }
      }

      if (pointer.active && nearestSnap && nearestSnap.dist < 72 && !prefersReduced) {
        const sx = nearestSnap.x;
        const sy = nearestSnap.y;
        const s = 10;
        const b = 4;
        ctx.strokeStyle = `rgba(${accentRgb}, 0.55)`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(sx - s, sy - s + b);
        ctx.lineTo(sx - s, sy - s);
        ctx.lineTo(sx - s + b, sy - s);
        ctx.moveTo(sx + s - b, sy + s);
        ctx.lineTo(sx + s, sy + s);
        ctx.lineTo(sx + s, sy + s - b);
        ctx.stroke();
      }

      // 3. Glowing food pellets on grid intersections
      if (!prefersReduced) {
        for (let i = 0; i < foods.length; i++) {
          const f = foods[i];
          const fx = toPxX(f.col);
          const fy = toPxY(f.row);
          const pulse = (Math.sin(t * 2.8 + f.phase) + 1) * 0.5;

          ctx.strokeStyle = `rgba(${accentRgb}, ${(0.18 + pulse * 0.25).toFixed(3)})`;
          ctx.lineWidth = 1;
          const haloSize = 4 + pulse * 2.5;
          ctx.strokeRect(fx - haloSize, fy - haloSize, haloSize * 2, haloSize * 2);

          ctx.fillStyle = `rgba(${accentRgb}, ${(0.45 + pulse * 0.4).toFixed(3)})`;
          ctx.fillRect(fx - 2, fy - 2, 4, 4);
        }
      }

      // 4. Autonomous grid-routing Snakes (food + snake-vs-snake hunting)
      if (!prefersReduced) {
        const dropFoodFromNodes = (nodesToDrop: GridPoint[], limit: number) => {
          let dropped = 0;
          for (const node of nodesToDrop) {
            if (dropped >= limit || foods.length >= 12) break;
            const tooCloseToFood = foods.some(
              (f) => Math.abs(f.col - node.col) + Math.abs(f.row - node.row) <= 2
            );
            if (!tooCloseToFood && !isBlockedCell(node.col, node.row)) {
              foods.push({
                col: node.col,
                row: node.row,
                phase: Math.random() * Math.PI * 2,
              });
              dropped++;
            }
          }
        };

        for (let i = 0; i < snakes.length; i++) {
          const s = snakes[i];
          s.progress += s.speedCellsPerSec * dt;

          while (s.progress >= 1) {
            s.progress -= 1;
            const head = s.nodes[0];

            const eatenIndex = foods.findIndex(
              (f) => f.col === head.col && f.row === head.row
            );
            if (eatenIndex !== -1) {
              bursts.push({
                x: toPxX(head.col),
                y: toPxY(head.row),
                bornAt: now,
              });
              if (bursts.length > 14) bursts.shift();

              if (s.nodes.length < 10) {
                s.growing += 1;
              }

              foods[eatenIndex] = spawnFood();
            }

            let selfDefeated = false;
            for (let j = 0; j < snakes.length; j++) {
              if (j === i) continue;
              const other = snakes[j];
              const hitIdx = other.nodes.findIndex(
                (n) => n.col === head.col && n.row === head.row
              );
              if (hitIdx === -1) continue;

              bursts.push({
                x: toPxX(head.col),
                y: toPxY(head.row),
                bornAt: now,
              });
              if (bursts.length > 14) bursts.shift();

              if (hitIdx === 0) {
                if (s.nodes.length >= other.nodes.length) {
                  if (s.nodes.length < 10) s.growing += 1;
                  dropFoodFromNodes(other.nodes.slice(1), 1);
                  snakes[j] = makeSnake();
                } else {
                  if (other.nodes.length < 10) other.growing += 1;
                  dropFoodFromNodes(s.nodes.slice(1), 1);
                  snakes[i] = makeSnake();
                  selfDefeated = true;
                  break;
                }
              } else {
                const severed = other.nodes.slice(hitIdx);
                other.nodes = other.nodes.slice(0, hitIdx);
                dropFoodFromNodes(severed.slice(1), 1);

                const gain = Math.min(2, severed.length);
                if (s.nodes.length + s.growing < 10) {
                  s.growing += gain;
                }

                if (other.nodes.length < 3) {
                  dropFoodFromNodes(other.nodes, 1);
                  snakes[j] = makeSnake();
                }
              }
            }

            if (selfDefeated) {
              break;
            }

            const nextDir = chooseNextDir(s);
            s.dir = nextDir;
            s.nodes.unshift({
              col: head.col + nextDir.dc,
              row: head.row + nextDir.dr,
            });

            if (s.growing > 0) {
              s.growing -= 1;
            } else if (s.nodes.length > 3) {
              s.nodes.pop();
            }
          }

          const activeSnake = snakes[i];
          if (activeSnake.nodes.length < 2) continue;

          const headTarget = activeSnake.nodes[0];
          const headPrev = activeSnake.nodes[1];
          const headX = toPxX(
            headPrev.col + (headTarget.col - headPrev.col) * activeSnake.progress
          );
          const headY = toPxY(
            headPrev.row + (headTarget.row - headPrev.row) * activeSnake.progress
          );

          const tailLast = activeSnake.nodes[activeSnake.nodes.length - 1];
          const tailNext = activeSnake.nodes[activeSnake.nodes.length - 2];
          const tailProgress = activeSnake.growing > 0 ? 0 : activeSnake.progress;
          const tailX = toPxX(
            tailLast.col + (tailNext.col - tailLast.col) * tailProgress
          );
          const tailY = toPxY(
            tailLast.row + (tailNext.row - tailLast.row) * tailProgress
          );

          const isLarge = activeSnake.nodes.length >= 8;
          const bodyOpacity = isLarge
            ? Math.min(0.5, activeSnake.opacity + 0.1)
            : activeSnake.opacity;

          ctx.strokeStyle = `rgba(${accentRgb}, ${bodyOpacity.toFixed(3)})`;
          ctx.lineWidth = isLarge ? 2.1 : 1.65;
          ctx.lineJoin = "miter";
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          for (let k = 1; k < activeSnake.nodes.length - 1; k++) {
            ctx.lineTo(
              toPxX(activeSnake.nodes[k].col),
              toPxY(activeSnake.nodes[k].row)
            );
          }
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.fillStyle = `rgba(${accentRgb}, ${(bodyOpacity * 0.9).toFixed(3)})`;
          for (let k = 1; k < activeSnake.nodes.length - 1; k++) {
            const jx = toPxX(activeSnake.nodes[k].col);
            const jy = toPxY(activeSnake.nodes[k].row);
            ctx.fillRect(jx - 1.5, jy - 1.5, 3, 3);
          }

          const headSize = isLarge ? 6 : 5;
          const halfHead = headSize / 2;
          ctx.fillStyle = `rgba(${accentRgb}, ${Math.min(0.92, bodyOpacity * 2.3).toFixed(3)})`;
          ctx.fillRect(headX - halfHead, headY - halfHead, headSize, headSize);
        }
      }

      // 5. Food-eaten / combat bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        const age = (now - b.bornAt) * 0.001;
        if (age > 0.55) {
          bursts.splice(i, 1);
          continue;
        }
        const size = 4 + age * 26;
        const alpha = (1 - age / 0.55) * 0.55;
        ctx.strokeStyle = `rgba(${accentRgb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.strokeRect(b.x - size, b.y - size, size * 2, size * 2);
      }

      // 6. Click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const age = (now - rp.bornAt) * 0.001;
        if (age > 1.1) {
          ripples.splice(i, 1);
          continue;
        }
        const radius = age * 260;
        const alpha = (1 - age / 1.1) * 0.28;
        ctx.strokeStyle = `rgba(${accentRgb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.1;
        ctx.strokeRect(rp.x - radius, rp.y - radius, radius * 2, radius * 2);
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("click", handleWindowClick);
    };
  }, [theme, mounted, prefersReduced, pointerRef, alignRef, excludeRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_50%_50%,black_55%,transparent_96%)]"
    />
  );
}
