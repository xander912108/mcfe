import { useRef, useCallback } from 'react';
import type { GraphEdge } from '@/data/graphData';

interface FlowParticle {
  edgeKey: string;
  edgeIndex: number;
  t: number;
  speed: number;
  life: number;
  decay: number;
  size: number;
  color: string;
}

interface EdgePath {
  sx: number; sy: number;
  cpx: number; cpy: number;
  ex: number; ey: number;
}

function getEdgeKey(edge: GraphEdge): string {
  return `${edge.source}-${edge.target}`;
}

export function useFlowParticles() {
  const particlesRef = useRef<FlowParticle[]>([]);
  const spawnTimerRef = useRef(0);
  const activeEdgesRef = useRef<Set<string>>(new Set());

  const spawnParticle = useCallback((edges: GraphEdge[], colors: Record<string, string>) => {
    if (edges.length === 0) return;
    const activeEdges = activeEdgesRef.current;

    // Build list of free edges
    const freeEdges: { index: number; key: string }[] = [];
    for (let i = 0; i < edges.length; i++) {
      const key = getEdgeKey(edges[i]);
      if (!activeEdges.has(key)) {
        freeEdges.push({ index: i, key });
      }
    }
    if (freeEdges.length === 0) return;

    // Pick random free edge
    const pick = freeEdges[Math.floor(Math.random() * freeEdges.length)];
    activeEdges.add(pick.key);

    const edge = edges[pick.index];
    const colorKey = edge.type || 'help';
    const baseColor = colors[colorKey] || colors.help || '#60a5fa';

    particlesRef.current.push({
      edgeKey: pick.key,
      edgeIndex: pick.index,
      t: 0.02 + Math.random() * 0.06,
      speed: 0.00025 + Math.random() * 0.0004,
      life: 1,
      decay: 0.0003 + Math.random() * 0.0004,
      size: 1.5 + Math.random() * 1.5,
      color: baseColor,
    });
  }, []);

  const updateAndDraw = useCallback((
    ctx: CanvasRenderingContext2D,
    edges: GraphEdge[],
    getEdgePath: (edge: GraphEdge) => EdgePath | null,
    colors: Record<string, string>,
    dpr: number,
    dt: number
  ) => {
    const particles = particlesRef.current;
    const activeEdges = activeEdgesRef.current;
    spawnTimerRef.current += dt;

    // Spawn every 3 seconds
    while (spawnTimerRef.current > 3000) {
      spawnParticle(edges, colors);
      spawnTimerRef.current -= 3000;
    }

    // Hard cap — remove oldest
    while (particles.length > 8) {
      const removed = particles.shift();
      if (removed) activeEdges.delete(removed.edgeKey);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const edge = edges[p.edgeIndex];

      // Validate: edge must exist AND its key must still match (edges array may have changed)
      if (!edge || getEdgeKey(edge) !== p.edgeKey) {
        activeEdges.delete(p.edgeKey);
        particles.splice(i, 1);
        continue;
      }

      const path = getEdgePath(edge);
      if (!path) {
        activeEdges.delete(p.edgeKey);
        particles.splice(i, 1);
        continue;
      }

      p.t += p.speed * (dt / 16);
      p.life -= p.decay * (dt / 16);

      if (p.t >= 1 || p.life <= 0) {
        activeEdges.delete(p.edgeKey);
        particles.splice(i, 1);
        continue;
      }

      // Quadratic bezier position: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const t1 = 1 - p.t;
      const px = t1 * t1 * path.sx + 2 * t1 * p.t * path.cpx + p.t * p.t * path.ex;
      const py = t1 * t1 * path.sy + 2 * t1 * p.t * path.cpy + p.t * p.t * path.ey;

      // Glow
      ctx.save();
      ctx.globalAlpha = p.life * 0.5;
      ctx.beginPath();
      ctx.arc(px, py, p.size * 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '18';
      ctx.fill();

      // Core
      ctx.globalAlpha = p.life * 0.85;
      ctx.beginPath();
      ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
  }, [spawnParticle]);

  return { updateAndDraw, particlesRef };
}
// cache bust 1781884831
