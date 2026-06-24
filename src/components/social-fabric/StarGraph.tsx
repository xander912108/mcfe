import { useRef, useEffect, useCallback } from 'react';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface StarGraphProps {
  centerNode: GraphNode;
  connectedNodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  highlightNodeId?: string | null;
  mode: 'participant' | 'leader';
  width: number;
  height: number;
}

interface RenderNode extends GraphNode {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

const ROLE_COLORS: Record<string, string> = {
  'Помощник по практике': '#C9A96E',
  'Помощник на старт': '#8b5cf6',
  'Хранитель знаний': '#f59e0b',
  'Куратор': '#ec4899',
  'Связующий': '#10b981',
  'default': '#6b7280',
};

const EDGE_COLORS: Record<string, string> = {
  help: '#C9A96E',
  review: '#10b981',
  flow: '#f59e0b',
  mentorship: '#ec4899',
  gratitude: '#f59e0b',
  mutual: '#06b6d4',
};

export function StarGraph({
  centerNode,
  connectedNodes,
  edges,
  onNodeHover,
  onNodeClick,
  highlightNodeId,
  mode,
  width,
  height,
}: StarGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, RenderNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Initialize node positions
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.28;

    // Center node
    const centerRn: RenderNode = {
      ...centerNode,
      x: cx,
      y: cy,
      targetX: cx,
      targetY: cy,
      radius: 36,
      opacity: 1,
      pulsePhase: 0,
    };
    nodesRef.current.set(centerNode.id, centerRn);

    // Connected nodes in a circle
    const count = connectedNodes.length;
    connectedNodes.forEach((node, i) => {
      const edge = edges.find(
        (e) => (e.source === centerNode.id && e.target === node.id) ||
               (e.target === centerNode.id && e.source === node.id)
      );
      const weight = edge?.weight ?? 5;
      const normalizedWeight = weight / 10;
      const r = baseRadius * (0.5 + 0.5 * (1 - normalizedWeight));
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;

      const existing = nodesRef.current.get(node.id);
      nodesRef.current.set(node.id, {
        ...node,
        x: existing?.x ?? cx + r * 0.3 * Math.cos(angle),
        y: existing?.y ?? cy + r * 0.3 * Math.sin(angle),
        targetX: cx + r * Math.cos(angle),
        targetY: cy + r * Math.sin(angle),
        radius: 28,
        opacity: existing?.opacity ?? 0,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    });
  }, [centerNode, connectedNodes, edges, width, height]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const animate = (ts: number) => {
      timeRef.current = ts;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, width, height);

      // Soft radial glow behind center
      const center = nodesRef.current.get(centerNode.id);
      if (center) {
        const grad = ctx.createRadialGradient(
          center.x, center.y, 0,
          center.x, center.y, 120
        );
        grad.addColorStop(0, 'rgba(201, 169, 110, 0.06)');
        grad.addColorStop(1, 'rgba(201, 169, 110, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(center.x - 120, center.y - 120, 240, 240);
      }

      // Draw edges first (behind nodes)
      edges.forEach((edge) => {
        const src = nodesRef.current.get(edge.source);
        const tgt = nodesRef.current.get(edge.target);
        if (!src || !tgt) return;

        const isHovered = hoveredRef.current === edge.source || hoveredRef.current === edge.target;
        const isHighlighted = highlightNodeId === edge.source || highlightNodeId === edge.target;

        ctx.save();
        ctx.globalAlpha = isHovered || isHighlighted ? 0.9 : 0.4;
        ctx.strokeStyle = EDGE_COLORS[edge.type] || '#9ca3af';
        ctx.lineWidth = Math.max(1, edge.weight * 0.35);

        // Curved line
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        const curvature = 0.15;
        const cpx = mx + (tgt.y - src.y) * curvature;
        const cpy = my - (tgt.x - src.x) * curvature;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpx, cpy, tgt.x, tgt.y);
        ctx.stroke();

        // Arrowhead for directed edges
        if (edge.type !== 'mutual' && edge.type !== 'flow') {
          const angle = Math.atan2(tgt.y - cpy, tgt.x - cpx);
          const arrowLen = 8;
          const arrowX = tgt.x - tgt.radius * Math.cos(angle);
          const arrowY = tgt.y - tgt.radius * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowLen * Math.cos(angle - 0.4),
            arrowY - arrowLen * Math.sin(angle - 0.4)
          );
          ctx.lineTo(
            arrowX - arrowLen * Math.cos(angle + 0.4),
            arrowY - arrowLen * Math.sin(angle + 0.4)
          );
          ctx.closePath();
          ctx.fillStyle = EDGE_COLORS[edge.type] || '#9ca3af';
          ctx.fill();
        }

        // Pulse animation for recent interactions
        if (edge.weight > 6) {
          const pulse = Math.sin(ts * 0.002 + src.pulsePhase) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(tgt.x, tgt.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = (EDGE_COLORS[edge.type] || '#9ca3af') + Math.floor(pulse * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw nodes
      nodesRef.current.forEach((node) => {
        // Smooth position interpolation
        node.x += (node.targetX - node.x) * 0.08;
        node.y += (node.targetY - node.y) * 0.08;
        node.opacity = Math.min(1, node.opacity + 0.02);

        const isCenter = node.id === centerNode.id;
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.3 : node.opacity;

        // Pulsing glow for online
        if (node.isOnline && !isCenter) {
          const pulse = Math.sin(ts * 0.003) * 4;
          const glowGrad = ctx.createRadialGradient(
            node.x, node.y, node.radius,
            node.x, node.y, node.radius + 12 + pulse
          );
          glowGrad.addColorStop(0, (ROLE_COLORS[node.role || 'default'] || '#6b7280') + '18');
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 12 + pulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Avatar circle background
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isCenter ? '#4f46e5' : '#f3f4f6';
        ctx.fill();

        // Center node: special styling
        if (isCenter) {
          // Pulsing center
          const centerPulse = Math.sin(ts * 0.0015) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4 + centerPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Я', node.x, node.y);
        } else {
          // Initials
          const initials = node.name.split(' ').map((n) => n[0]).join('');
          ctx.fillStyle = ROLE_COLORS[node.role || 'default'] || '#6b7280';
          ctx.font = 'bold 13px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, node.x, node.y);
        }

        // Border with role color
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ROLE_COLORS[node.role || 'default'] || '#d1d5db';
        ctx.lineWidth = isCenter ? 3 : 2.5;
        ctx.stroke();

        // "Help ready" badge
        if (node.isHelpReady && !isCenter) {
          const bx = node.x + node.radius * 0.65;
          const by = node.y - node.radius * 0.65;
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Leader signals
        if (mode === 'leader') {
          if (node.status === 'stuck') {
            drawSignalBadge(ctx, node.x - node.radius, node.y - node.radius, '#ef4444');
          }
          if (node.status === 'burnout_risk') {
            drawSignalBadge(ctx, node.x - node.radius, node.y - node.radius - 14, '#f59e0b');
          }
        }

        // Name label
        ctx.font = isCenter ? 'bold 13px Inter, system-ui, sans-serif' : '12px Inter, system-ui, sans-serif';
        ctx.fillStyle = isCenter ? '#1e1b4b' : '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 18);

        // Role label
        if (node.role && !isCenter) {
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#9ca3af';
          ctx.fillText(node.role, node.x, node.y + node.radius + 32);
        }

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [centerNode, edges, width, height, mode, highlightNodeId]);

  const drawSignalBadge = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // Mouse handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };

      // Hit test: find nearest node
      let nearest: string | null = null;
      let minDist = Infinity;
      nodesRef.current.forEach((node) => {
        const dist = Math.hypot(node.x - mx, node.y - my);
        if (dist < node.radius + 8 && dist < minDist) {
          minDist = dist;
          nearest = node.id;
        }
      });

      if (nearest !== hoveredRef.current) {
        hoveredRef.current = nearest;
        const node = nearest ? nodesRef.current.get(nearest) ?? null : null;
        onNodeHover(node);
        canvas.style.cursor = nearest ? 'pointer' : 'default';
      }
    },
    [onNodeHover]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const allNodes = Array.from(nodesRef.current.values());
      const found = allNodes.find((n) => {
        const dist = Math.hypot(n.x - mx, n.y - my);
        return dist < n.radius + 8;
      });

      if (found && found.id !== 'me') {
        onNodeClick(found);
      }
    },
    [onNodeClick]
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="rounded-lg cursor-default"
    />
  );
}
