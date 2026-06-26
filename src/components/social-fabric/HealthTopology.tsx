import { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface HealthTopologyProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  onStatusFilter?: (status: string | null) => void;
  activeStatusFilter?: string | null;
  width: number;
  height: number;
  focusMode?: boolean;
  darkMode?: boolean;
  camera?: ReturnType<typeof useCamera>;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  spotlightAlpha: number;
}

// Status-based colors — high contrast, clearly distinct
export const STATUS_COLORS: Record<string, { core: string; glow: string; border: string; label: string; bg: string; shortLabel: string }> = {
  active: {
    core: 'rgba(34, 197, 94, 0.30)',
    glow: 'rgba(34, 197, 94, 0.18)',
    border: 'rgba(34, 197, 94, 0.65)',
    label: 'В устойчивом движении',
    shortLabel: 'В движении',
    bg: 'rgba(34, 197, 94, 0.10)',
  },
  stuck: {
    core: 'rgba(234, 179, 8, 0.30)',
    glow: 'rgba(234, 179, 8, 0.18)',
    border: 'rgba(234, 179, 8, 0.70)',
    label: 'Нужен мягкий импульс',
    shortLabel: 'Импульс',
    bg: 'rgba(234, 179, 8, 0.10)',
  },
  burnout_risk: {
    core: 'rgba(249, 115, 22, 0.30)',
    glow: 'rgba(249, 115, 22, 0.20)',
    border: 'rgba(255, 107, 53, 0.80)',
    label: 'Много помогает, может устать',
    shortLabel: 'Может устать',
    bg: 'rgba(249, 115, 22, 0.10)',
  },
  inactive: {
    core: 'rgba(239, 68, 68, 0.28)',
    glow: 'rgba(239, 68, 68, 0.16)',
    border: 'rgba(255, 71, 87, 0.80)',
    label: 'Нужна первая связь',
    shortLabel: 'Первая связь',
    bg: 'rgba(239, 68, 68, 0.10)',
  },
};

function statusColor(s: string) {
  return STATUS_COLORS[s] || STATUS_COLORS.active;
}

export function HealthTopology({
  nodes, edges, onNodeHover, onNodeClick, activeStatusFilter, width, height,
  darkMode = true, camera: externalCamera,
}: HealthTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalCam = useCamera(width, height, 0.55);
  const cam = externalCamera ?? internalCam;
  const simRef = useRef<Map<string, SimNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const filterRef = useRef<string | null>(activeStatusFilter ?? null);

  // Keep filterRef in sync without re-init
  useEffect(() => {
    filterRef.current = activeStatusFilter ?? null;
  }, [activeStatusFilter]);

  useEffect(() => {
    const cx = width / 2;
    const cy = height * 0.42;

    nodes.forEach((node, i) => {
      const prev = simRef.current.get(node.id);
      const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
      const dist = 80 + Math.random() * Math.min(width, height) * 0.2;
      const nodeEdges = edges.filter((e) => e.source === node.id || e.target === node.id);

      simRef.current.set(node.id, {
        ...node,
        x: prev?.x ?? cx + dist * Math.cos(angle),
        y: prev?.y ?? cy + dist * Math.sin(angle),
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        radius: 22 + Math.min(nodeEdges.length, 4) * 3,
        pulsePhase: Math.random() * Math.PI * 2,
        spotlightAlpha: prev?.spotlightAlpha ?? 1,
      });
    });
  }, [nodes, edges, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const animate = (ts: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Background — screen coords (before camera transform)
      const bgGrad = ctx.createRadialGradient(width / 2, height * 0.42, 0, width / 2, height * 0.42, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, darkMode ? '#151310' : '#F3EFE8');
      bgGrad.addColorStop(0.5, darkMode ? '#0E0D0B' : '#EDE9E0');
      bgGrad.addColorStop(1, darkMode ? '#0A0908' : '#E8E3D8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      cam.applyTransform(ctx);

      const simNodes = Array.from(simRef.current.values());
      const af = filterRef.current;

      // Physics
      const repulsionK = 2800;
      const springK = 0.005;
      const damping = 0.88;
      const centerPull = 0.001;
      const centerX = width / 2;
      const centerY = height * 0.42;

      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const force = repulsionK / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      edges.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.hypot(dx, dy) || 1;
        const idealLen = 100 + (10 - edge.weight) * 10;
        const force = springK * (dist - idealLen);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      });

      simNodes.forEach((node) => {
        node.vx += (centerX - node.x) * centerPull;
        node.vy += (centerY - node.y) * centerPull;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        const pad = node.radius + 20;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      });

      // Smooth spotlight lerp
      simRef.current.forEach((node) => {
        const isSpotlightMatch = !af || node.status === af;
        const targetAlpha = isSpotlightMatch ? 1 : 0.18;
        node.spotlightAlpha += (targetAlpha - node.spotlightAlpha) * 0.08;
      });

      // Draw edges — subtle, spotlight-aware
      edges.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;
        const edgeAlpha = Math.min(src.spotlightAlpha, tgt.spotlightAlpha);
        ctx.strokeStyle = edgeAlpha > 0.5
          ? `rgba(154, 152, 149, ${0.15 * edgeAlpha})`
          : `rgba(154, 152, 149, ${0.04 + 0.08 * edgeAlpha})`;
        ctx.lineWidth = edgeAlpha > 0.5 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
      });

      // Draw nodes — status-colored, spotlight-aware
      simRef.current.forEach((node) => {
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id;
        const sc = statusColor(node.status);
        const t = ts / 1000;

        // Spotlight: use smoothed alpha
        const sa = node.spotlightAlpha;
        const nodeAlpha = isDimmed ? sa * 0.35 : sa;

        ctx.save();
        ctx.globalAlpha = nodeAlpha;

        // Pulsing glow for stuck/burnout/inactive
        if (node.status !== 'active') {
          const pulseR = node.radius + 22 + Math.sin(t * 1.8 + node.pulsePhase) * 10;
          const pulseAlpha = 0.10 + Math.sin(t * 1.8 + node.pulsePhase) * 0.06;
          const pulseGrad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.6, node.x, node.y, pulseR);
          pulseGrad.addColorStop(0, sc.border.replace(/[\d.]+\)$/, `${pulseAlpha + 0.05})`));
          pulseGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = pulseGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer glow
        const glowR = node.radius + 14;
        const glowGrad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, glowR);
        glowGrad.addColorStop(0, sc.glow);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Inline avatar — gradient placeholder with initials, drawn in local coords
        // (no clip() to avoid conflict with globalAlpha set above)
        const avatarR = node.radius;
        // Deterministic color from name
        let hash = 0;
        for (let i = 0; i < node.name.length; i++) hash = node.name.charCodeAt(i) + ((hash << 5) - hash);
        const h = Math.abs(hash % 360);
        const h2 = (h + 30) % 360;
        const c1 = `hsl(${h}, 55%, 35%)`;
        const c2 = `hsl(${h2}, 50%, 25%)`;
        const ag = ctx.createRadialGradient(node.x - avatarR * 0.3, node.y - avatarR * 0.3, 1, node.x, node.y, avatarR);
        ag.addColorStop(0, c1);
        ag.addColorStop(1, c2);
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(node.x, node.y, avatarR, 0, Math.PI * 2);
        ctx.fill();

        // Initials
        const initials = node.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `bold ${Math.max(10, avatarR * 0.55)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, node.x, node.y + 1);

        // Status border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.6)' : sc.border;
        ctx.lineWidth = isHovered ? 2.5 : 2;
        ctx.stroke();

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 14, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Name pill below node
        const nameText = node.name;

        // Name and role labels hidden at zoom <= initialZoom (0.55)
        if (cam.cameraRef.current.zoom > 0.55) {
          const nameWidth = ctx.measureText(nameText).width;
          ctx.fillStyle = 'rgba(8, 12, 26, 0.88)';
          ctx.beginPath();
          ctx.roundRect(node.x - nameWidth / 2 - 7, node.y + node.radius + 6, nameWidth + 14, 20, 5);
          ctx.fill();

          ctx.font = '11px Inter, system-ui, sans-serif';
          ctx.fillStyle = isHovered ? '#e2e8f0' : '#9A9895';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nameText, node.x, node.y + node.radius + 16);

          // Role (if any)
          if (node.role) {
            ctx.font = '9px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(154, 152, 149, 0.5)';
            ctx.fillText(node.role, node.x, node.y + node.radius + 32);
          }
        }

        // Online dot
        if (node.isOnline) {
          ctx.beginPath();
          ctx.arc(node.x + node.radius - 2, node.y - node.radius + 4, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.strokeStyle = darkMode ? '#0E0D0B' : '#EDE9E0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      ctx.restore();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, edges, width, height, cam]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (cam.updatePan(e.clientX, e.clientY)) {
      canvas.style.cursor = 'grabbing';
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const world = cam.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    let nearest: string | null = null;
    let minDist = Infinity;
    simRef.current.forEach((node) => {
      // All nodes remain interactive — spotlight only affects visual alpha
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist < node.radius + 15 && dist < minDist) { minDist = dist; nearest = node.id; }
    });
    if (nearest !== hoveredRef.current) {
      hoveredRef.current = nearest;
      onNodeHover(nearest ? simRef.current.get(nearest) ?? null : null);
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
    }
  }, [onNodeHover, cam]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = cam.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const found = Array.from(simRef.current.values()).find((n) => {
      // All nodes remain clickable — spotlight is visual only
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 15;
    });
    if (found) return;
    cam.startPan(e.clientX, e.clientY);
    canvas.style.cursor = 'grabbing';
  }, [cam]);

  const handleMouseUp = useCallback(() => {
    cam.endPan();
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
  }, [cam]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    cam.handleWheel(e, canvasRef.current);
  }, [cam]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cam.wasDrag(e.clientX, e.clientY)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = cam.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const found = Array.from(simRef.current.values()).find((n) => {
      // All nodes remain clickable — spotlight is visual only
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 15;
    });
    if (found) onNodeClick(found);
  }, [onNodeClick, cam]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: darkMode ? '#0E0D0B' : '#EDE9E0' }}>
        <p className="text-subtitle text-stone-400">Нет данных для диагностики</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onDoubleClick={cam.reset}
        className="cursor-grab active:cursor-grabbing"
      />

      </div>
  );
}
