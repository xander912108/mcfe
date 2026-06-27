import { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { drawNodeAvatar } from '@/hooks/useNodeAvatars';
import type { GraphNode, GraphEdge } from '@/data/graphData';
import { drawPremiumCanvasLabel, drawPremiumCanvasMetaLabel } from './canvasLabels';

interface PulseTopologyProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
  focusMode?: boolean;
  darkMode?: boolean;
  period?: number;
  onPeriodChange?: (period: number) => void;
  camera?: ReturnType<typeof useCamera>;
  highlightNodeIds?: Set<string> | null;
  dimOpacity?: number;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  temperature: number; // 0=cold, 1=hot
  radius: number;
  pulseOffset: number;
}

// Temperature color scale: cold (deep blue) → warm (cyan/green) → hot (orange/red)
// Enhanced contrast between levels so each temperature band is visually distinct
function tempColor(t: number): string {
  if (t < 0.2) {
    // Deep blue → cyan (cold, isolated)
    const k = t / 0.2;
    return `rgb(${15 + k * 25}, ${50 + k * 130}, ${195 + k * 60})`;
  } else if (t < 0.4) {
    // Cyan → teal (cool, few connections)
    const k = (t - 0.2) / 0.2;
    return `rgb(${40 + k * 30}, ${180 + k * 70}, ${255 - k * 155})`;
  } else if (t < 0.6) {
    // Teal → green (warm, active)
    const k = (t - 0.4) / 0.2;
    return `rgb(${70 + k * 50}, ${250 - k * 30}, ${100 - k * 40})`;
  } else if (t < 0.8) {
    // Green → orange (hot, engaged)
    const k = (t - 0.6) / 0.2;
    return `rgb(${120 + k * 135}, ${220 - k * 140}, ${60 - k * 35})`;
  } else {
    // Orange → vivid red (very hot, core)
    const k = (t - 0.8) / 0.2;
    return `rgb(${255}, ${80 - k * 60}, ${25 + k * 15})`;
  }
}

export function PulseTopology({
  nodes, edges, onNodeHover, onNodeClick, width, height,
  darkMode = true, period = 7, onPeriodChange, camera: externalCamera,
  highlightNodeIds, dimOpacity = 0.18,
}: PulseTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalCam = useCamera(width, height);
  const cam = externalCamera ?? internalCam;
  const simRef = useRef<Map<string, SimNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  // Initialize
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;

    nodes.forEach((node, i) => {
      const prev = simRef.current.get(node.id);
      const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
      const dist = 60 + Math.random() * Math.min(width, height) * 0.25;

      // Temperature: based on connections + activity
      const nodeEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
      const weightSum = nodeEdges.reduce((s, e) => s + e.weight, 0);
      const hasRecent = nodeEdges.some((e) => e.weight > 4);
      const baseTemp = Math.min(1, 0.15 + (nodeEdges.length / 8) * 0.4 + (weightSum / 40) * 0.3 + (hasRecent ? 0.15 : 0));

      simRef.current.set(node.id, {
        ...node,
        x: prev?.x ?? cx + dist * Math.cos(angle),
        y: prev?.y ?? cy + dist * Math.sin(angle),
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        temperature: baseTemp,
        radius: 20 + baseTemp * 14,
        pulseOffset: prev?.pulseOffset ?? Math.random() * 5000,
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

    const animate = (_ts: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Background — screen coords (before camera transform)
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, darkMode ? '#151310' : '#F3EFE8');
      bgGrad.addColorStop(0.5, darkMode ? '#0E0D0B' : '#EDE9E0');
      bgGrad.addColorStop(1, darkMode ? '#0A0908' : '#E8E3D8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      cam.applyTransform(ctx);

      // Physics
      const simNodes = Array.from(simRef.current.values());
      const repulsionK = 3000;
      const springK = 0.006;
      const damping = 0.88;
      const centerPull = 0.002;

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
        const idealLen = 80 + (10 - edge.weight) * 10;
        const force = springK * (dist - idealLen);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      });

      simNodes.forEach((node) => {
        node.vx += (width / 2 - node.x) * centerPull;
        node.vy += (height / 2 - node.y) * centerPull;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        const pad = node.radius + 20;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      });

      // Draw edges — clean lines, no glow
      edges.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;

        const avgTemp = (src.temperature + tgt.temperature) / 2;

        // Connection line colored by temperature
        ctx.strokeStyle = tempColor(avgTemp).replace('rgb', 'rgba').replace(')', ', 0.25)');
        ctx.lineWidth = 1 + avgTemp * 2;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();

        // Arrowhead — directed from helper to receiver
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
        const arrowLen = 8;
        const distToEdge = tgt.radius + 6;
        const arrowX = tgt.x - distToEdge * Math.cos(angle);
        const arrowY = tgt.y - distToEdge * Math.sin(angle);
        ctx.fillStyle = tempColor(avgTemp).replace('rgb', 'rgba').replace(')', ', 0.5)');
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowLen * Math.cos(angle - 0.4), arrowY - arrowLen * Math.sin(angle - 0.4));
        ctx.lineTo(arrowX - arrowLen * Math.cos(angle + 0.4), arrowY - arrowLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
      });

      // Draw nodes as temperature blobs
      simRef.current.forEach((node) => {
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id;
        const isFilterDimmed = highlightNodeIds && !highlightNodeIds.has(node.id);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.35 : isFilterDimmed ? dimOpacity : 1;

        // Avatar — circular gradient placeholder (photo-ready)
        drawNodeAvatar(ctx, node.x, node.y, node.radius * 0.92, node.id, node.name, node.avatar);

        // Temperature tint overlay (subtle color warmth based on activity)
        const tintGrad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.3, node.x, node.y, node.radius);
        tintGrad.addColorStop(0, tempColor(node.temperature).replace('rgb', 'rgba').replace(')', ', 0.15)'));
        tintGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tintGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // PULSE animation for hot nodes (temperature > 0.6) — breathing ring
        if (node.temperature > 0.6) {
          const CYCLE = 5000;
          const PULSE_DURATION = 2000;
          const t = (_ts + node.pulseOffset) % CYCLE;
          if (t < PULSE_DURATION) {
            const phase = t / PULSE_DURATION;
            const envelope = Math.sin(phase * Math.PI) ** 2;
            const alpha = envelope * 0.6;
            const pulseR = node.radius + 4 + envelope * 5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${100 + Math.floor(node.temperature * 80)}, ${Math.floor(node.temperature * 60)}, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Problem indicator — red border for isolated / 0 connections
        const nodeEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
        const isIsolated = nodeEdges.length === 0;
        const isStuck = node.status === 'stuck';
        if (isIsolated || isStuck) {
          // Red warning border — clearly outside the node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Name
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillStyle = isHovered ? '#ffffff' : `rgba(226, 232, 240, ${0.6 + node.temperature * 0.4})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Name label — only visible when zoomed in (> 1.0) or on hover
        if (isHovered || cam.cameraRef.current.zoom > 1.0) {
          const nameText = node.name;
          drawPremiumCanvasLabel(ctx, nameText, node.x, node.y + node.radius + 16, { hovered: isHovered, darkMode, font: '9px Inter, system-ui, sans-serif' });

          // Role (if hot enough)
          if (node.role && node.temperature > 0.3) {
            drawPremiumCanvasMetaLabel(ctx, node.role, node.x, node.y + node.radius + 32, '#9A9895', { font: '8px Inter, system-ui, sans-serif' });
          }
        }

        // Temperature indicator dot
        const dotColor = tempColor(node.temperature);
        ctx.beginPath();
        ctx.arc(node.x + node.radius + 4, node.y - node.radius + 4, 4, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      });

      ctx.restore();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, edges, width, height, cam, darkMode, highlightNodeIds, dimOpacity]);

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
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist < node.radius + 10 && dist < minDist) { minDist = dist; nearest = node.id; }
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
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
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
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
    });
    if (found) onNodeClick(found);
  }, [onNodeClick, cam]);

  // Empty state
  if (nodes.length === 0 || edges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: darkMode ? '#0E0D0B' : '#EDE9E0' }}>
        <div className="text-center px-8 max-w-sm">
          <p className="text-subtitle text-stone-400 mb-2">Пульс пока формируется</p>
          <p className="text-caption text-stone-600 leading-relaxed">
            Когда появятся первые живые действия — помощь, разборы, благодарности, 
            новые связи или участие в ритуалах — здесь станет видно, 
            где сообщество набирает тепло.
          </p>
        </div>
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

      {/* Time period scale overlay */}
      {onPeriodChange && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 shrink-0 transition-all duration-300">
          {[7, 30, 90].map((d) => {
            const isActive = period === d;
            return (
              <button
                key={d}
                onClick={() => onPeriodChange(d)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 border whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/25"
                    : "bg-[var(--hover-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {d} дней
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
