import { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { drawNodeAvatar } from '@/hooks/useNodeAvatars';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface NetworkTopologyProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  bridges?: GraphEdge[];
  centerNode: GraphNode;
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  highlightNodeId?: string | null;
  width: number;
  height: number;
  focusMode?: boolean;
  darkMode?: boolean;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseOffset: number; // individual breathing offset in ms (0–5000)
}

function getColors(dark: boolean) {
  return {
    bgGradient: dark ? ['#1a1814', '#141416', '#0f0f12'] : ['#FDFBF7', '#FAFAF8', '#F5F4F0'],
    center: {
      fill: dark ? '#5a4a2a' : '#8a7a4a', glow: dark ? 'rgba(201, 169, 110, 0.4)' : 'rgba(201, 169, 110, 0.3)',
      pulse: 'rgba(201, 169, 110, 0.15)', text: '#ffffff', border: '#C9A96E',
    },
    nodes: {
      online: { fill: dark ? '#3a3020' : '#f5efe3', glow: dark ? 'rgba(201, 169, 110, 0.6)' : 'rgba(201, 169, 110, 0.4)', border: '#C9A96E' },
      offline: { fill: dark ? '#1c1c1f' : '#f0eeea', glow: dark ? 'rgba(160, 174, 192, 0.15)' : 'rgba(160, 174, 192, 0.1)', border: dark ? '#4a4a4e' : '#c8c5bf' },
      stuck: { fill: '#3c2a1e', glow: 'rgba(237, 137, 54, 0.25)', border: '#ed8936' },
      burnout: { fill: '#3c1e1e', glow: 'rgba(245, 101, 101, 0.2)', border: '#f56565' },
    },
    edges: {
      help: '#7a8faf', review: '#6B9E7C', flow: '#ed8936',
      mentorship: '#B89cc0', gratitude: '#ecc94b', mutual: '#38b2ac',
      default: dark ? '#2a2a2e' : '#d8d5cf', decaying: dark ? '#1c1c1f' : '#e8e5df',
    },
    bridgeColors: {
      mutual: '#38b2ac', flow: '#ed8936',
      default: dark ? '#4a4a4e' : '#c8c5bf',
    },
    roleColors: {
      'Помощник по практике': '#C9A96E', 'Помощник на старт': '#B89cc0',
      'Хранитель знаний': '#d69e2e', 'Куратор': '#ed64a6',
      'Связующий': '#6B9E7C', default: dark ? '#6A6865' : '#999999',
    } as Record<string, string>,
  };
}

export function NetworkTopology({
  nodes, edges, bridges = [], centerNode, onNodeHover, onNodeClick, highlightNodeId, width, height,
darkMode = true,
}: NetworkTopologyProps) {
  const COLORS = getColors(darkMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Map<string, SimNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const timeRef = useRef(0);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const cam = useCamera(width, height);

  // All edges: my edges + bridges between participants
  const allEdges = useRef<GraphEdge[]>([]);
  useEffect(() => {
    allEdges.current = [...edges, ...bridges];
  }, [edges, bridges]);

  // Initialize simulation
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    const allNodes = [centerNode, ...nodes];
    const existing = simRef.current;

    // Seed positions: "me" slightly offset from center, others spread freely
    allNodes.forEach((node, i) => {
      const prev = existing.get(node.id);
      // Don't place everyone radially around center — use semi-random spread
      const isMe = node.id === centerNode.id;
      const angle = (2 * Math.PI * i) / allNodes.length + (isMe ? 0 : Math.PI / 3);
      const dist = isMe ? 30 + Math.random() * 40 : 100 + Math.random() * 140;
      simRef.current.set(node.id, {
        ...node,
        x: prev?.x ?? cx + dist * Math.cos(angle),
        y: prev?.y ?? cy + dist * Math.sin(angle),
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        radius: isMe ? 30 : 26,
        opacity: prev?.opacity ?? 0,
        pulseOffset: prev?.pulseOffset ?? Math.random() * 5000,
      });
    });
  }, [centerNode, nodes, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (canvas.width <= 0 || canvas.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const animate = (ts: number) => {
      timeRef.current = ts;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Background — screen coords (before camera transform)
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, COLORS.bgGradient[0]);
      bgGrad.addColorStop(0.5, COLORS.bgGradient[1]);
      bgGrad.addColorStop(1, darkMode ? '#0f0f12' : '#F5F4F0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      cam.applyTransform(ctx);

      // Physics step
      const simNodes = Array.from(simRef.current.values());
      const repulsionK = 3200;
      const springK = 0.01;
      const damping = 0.88;

      // Repulsion (all nodes push apart equally)
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
          if (!dragRef.current || dragRef.current.id !== a.id) { a.vx -= fx; a.vy -= fy; }
          if (!dragRef.current || dragRef.current.id !== b.id) { b.vx += fx; b.vy += fy; }
        }
      }

      // Spring forces (all edges including bridges)
      allEdges.current.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.hypot(dx, dy) || 1;
        const idealLen = 90 + (10 - edge.weight) * 10;
        const displacement = dist - idealLen;
        const force = springK * displacement;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!dragRef.current || dragRef.current.id !== src.id) { src.vx += fx; src.vy += fy; }
        if (!dragRef.current || dragRef.current.id !== tgt.id) { tgt.vx -= fx; tgt.vy -= fy; }
      });

      // Center pull — "me" gets slightly more pull, but not dominating
      simNodes.forEach((node) => {
        if (dragRef.current?.id === node.id) return;
        const isMe = node.id === centerNode.id;
        const pull = isMe ? 0.004 : 0.002;
        node.vx += (width / 2 - node.x) * pull;
        node.vy += (height / 2 - node.y) * pull;
        // Integrate
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        // Clamp
        const pad = node.radius + 20;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
        // Fade in
        node.opacity = Math.min(1, node.opacity + 0.012);
      });

      // Ambient glow
      const ambientGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 180);
      ambientGlow.addColorStop(0, 'rgba(201, 169, 110, 0.06)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(width / 2 - 200, height / 2 - 200, 400, 400);

      // Draw EDGES — bridges first (brighter), then my edges
      const edgeList = allEdges.current;
      const myEdgeSet = new Set(edges.map((e) => `${e.source}-${e.target}`));

      edgeList.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;

        const isBridge = !myEdgeSet.has(`${edge.source}-${edge.target}`) && !myEdgeSet.has(`${edge.target}-${edge.source}`);
        const isHovered = hoveredRef.current === edge.source || hoveredRef.current === edge.target;
        const isHighlighted = highlightNodeId === edge.source || highlightNodeId === edge.target;
        const isCenterEdge = edge.source === centerNode.id || edge.target === centerNode.id;

        ctx.save();
        // Bridges: brighter, more visible. My edges: standard. Between others: dim.
        let edgeOpacity: number;
        let lineWidth: number;
        if (isHovered || isHighlighted) {
          edgeOpacity = 0.95;
          lineWidth = Math.max(1.5, edge.weight * 0.45);
        } else if (isBridge) {
          edgeOpacity = 0.65;
          lineWidth = Math.max(0.8, edge.weight * 0.3);
        } else if (isCenterEdge) {
          edgeOpacity = 0.45;
          lineWidth = Math.max(0.6, edge.weight * 0.25);
        } else {
          edgeOpacity = 0.2;
          lineWidth = Math.max(0.4, edge.weight * 0.18);
        }

        const edgeColor = isBridge
          ? (COLORS.bridgeColors[edge.type as keyof typeof COLORS.bridgeColors] || COLORS.bridgeColors.default)
          : (COLORS.edges[edge.type as keyof typeof COLORS.edges] || COLORS.edges.default);

        if (edge.weight <= 2) {
          ctx.setLineDash([4, 6]);
          ctx.globalAlpha = edgeOpacity * 0.4;
        } else {
          ctx.setLineDash([]);
          ctx.globalAlpha = edgeOpacity;
        }

        // Curved bezier
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        const curvature = 0.08;
        const cpx = mx + (tgt.y - src.y) * curvature;
        const cpy = my - (tgt.x - src.x) * curvature;

        const lineGrad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
        lineGrad.addColorStop(0, edgeColor + '00');
        lineGrad.addColorStop(0.35, edgeColor + Math.floor(edgeOpacity * 180).toString(16).padStart(2, '0'));
        lineGrad.addColorStop(0.65, edgeColor + Math.floor(edgeOpacity * 140).toString(16).padStart(2, '0'));
        lineGrad.addColorStop(1, edgeColor + '00');

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpx, cpy, tgt.x, tgt.y);
        ctx.stroke();

        // Glow on hover
        if (isHovered || (isBridge && !isCenterEdge)) {
          ctx.globalAlpha = isHovered ? edgeOpacity * 0.15 : edgeOpacity * 0.08;
          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = lineWidth * (isHovered ? 5 : 3);
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.quadraticCurveTo(cpx, cpy, tgt.x, tgt.y);
          ctx.stroke();
        }

        // Bridge label (small text on the line)
        if (isBridge && edgeOpacity > 0.3) {
          ctx.globalAlpha = edgeOpacity * 0.6;
          ctx.fillStyle = edgeColor;
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const label = edge.type === 'mutual' ? 'общий контекст' : edge.type === 'flow' ? 'общий трек' : '';
          if (label) {
            // Draw label at midpoint with small background
            const lw = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(8, 12, 26, 0.85)';
            ctx.beginPath();
            ctx.roundRect(cpx - lw / 2 - 4, cpy - 7, lw + 8, 14, 3);
            ctx.fill();
            ctx.fillStyle = edgeColor + 'cc';
            ctx.fillText(label, cpx, cpy + 1);
          }
        }

        // Arrowheads for directed edges
        if (edge.type !== 'mutual' && edge.type !== 'flow') {
          const angle = Math.atan2(tgt.y - cpy, tgt.x - cpx);
          const arrowLen = isHovered ? 10 : 7;
          const distToEdge = tgt.radius + 4;
          const arrowX = tgt.x - distToEdge * Math.cos(angle);
          const arrowY = tgt.y - distToEdge * Math.sin(angle);
          ctx.globalAlpha = edgeOpacity;
          ctx.fillStyle = edgeColor;
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - arrowLen * Math.cos(angle - 0.4), arrowY - arrowLen * Math.sin(angle - 0.4));
          ctx.lineTo(arrowX - arrowLen * Math.cos(angle + 0.4), arrowY - arrowLen * Math.sin(angle + 0.4));
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw NODES
      simRef.current.forEach((node) => {
        const isCenter = node.id === centerNode.id;
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id && hoveredRef.current !== centerNode.id;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.35 : node.opacity;

        let nodeScheme = COLORS.nodes.offline;
        if (isCenter) nodeScheme = COLORS.center;
        else if (node.status === 'stuck') nodeScheme = COLORS.nodes.stuck;
        else if (node.status === 'burnout_risk') nodeScheme = COLORS.nodes.burnout;
        else if (node.isOnline) nodeScheme = COLORS.nodes.online;

        // Online indicator will be drawn after border (see below)

        // Center node — subtle rings, not dominating
        if (isCenter) {
          const op = Math.sin(ts * 0.0012) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10 + op, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.1)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node body
        if (isCenter) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          const cg = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, node.radius);
          cg.addColorStop(0, '#2a4a73');
          cg.addColorStop(1, '#3a3020');
          ctx.fillStyle = cg;
          ctx.fill();
        } else {
          // Avatar — circular gradient placeholder (photo-ready)
          drawNodeAvatar(ctx, node.x, node.y, node.radius * 0.92, node.id, node.name, node.avatar);
        }

        // Border
        const borderColor = isCenter ? '#C9A96E' : node.role ? COLORS.roleColors[node.role] || COLORS.roleColors.default : nodeScheme.border;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isCenter ? 2 : 1.6;
        ctx.stroke();

        // RECENT ACTIVITY — role-colored glow outside circle (Level 1)
        if (!isCenter && node.role) {
          const nodeEdges = allEdges.current.filter(
            (e) => (e.source === node.id && e.target === centerNode.id) ||
                   (e.target === node.id && e.source === centerNode.id)
          );
          const hasRecent = nodeEdges.some((e) => {
            const d = new Date(e.lastInteraction);
            const now = new Date('2026-06-17');
            const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            return days <= 7;
          });
          if (hasRecent) {
            const glowR = node.radius + 10;
            const glowGrad = ctx.createRadialGradient(node.x, node.y, node.radius + 2, node.x, node.y, glowR);
            glowGrad.addColorStop(0, borderColor + '40');
            glowGrad.addColorStop(0.6, borderColor + '18');
            glowGrad.addColorStop(1, borderColor + '00');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ONLINE breathing — interval pulse with individual offset
        if (node.isOnline && !isCenter) {
          const CYCLE = 5000;
          const PULSE_DURATION = 2000;
          const t = (ts + node.pulseOffset) % CYCLE;

          if (t < PULSE_DURATION) {
            const phase = t / PULSE_DURATION;
            const envelope = Math.sin(phase * Math.PI) ** 2;
            const alpha = envelope * 0.85;
            const radius1 = node.radius + 3 + envelope * 2;
            const radius2 = node.radius + 5 + envelope * 3;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius1, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Text
        if (isCenter) {
          ctx.fillStyle = COLORS.center.text;
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Я', node.x, node.y);
        } else {
          // Avatar rendered above — initials removed
        }

        // Help ready badge — indigo to distinguish from online
        if (node.isHelpReady && !isCenter) {
          const bx = node.x + node.radius * 0.7;
          const by = node.y - node.radius * 0.7;
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(201, 169, 110, 0.35)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#C9A96E';
          ctx.fill();
          ctx.strokeStyle = darkMode ? '#141416' : '#e8e5df';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Name + role labels — zoom-dependent (center node name hidden)
        const showLabels = isCenter || cam.cameraRef.current.zoom > 1.1;
        if (showLabels && !isCenter) {
          ctx.font = '12px Inter, system-ui, sans-serif';
          ctx.fillStyle = isHovered ? '#ffffff' : '#9A9895';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x, node.y + node.radius + 16);

          if (node.role) {
            ctx.font = '11px Inter, system-ui, sans-serif';
            const rc = COLORS.roleColors[node.role] || COLORS.roleColors.default;
            ctx.fillStyle = rc + 'cc';
            ctx.fillText(node.role, node.x, node.y + node.radius + 30);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      ctx.restore(); // end camera transform

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [centerNode, edges, bridges, width, height, highlightNodeId]);

  // Mouse handlers with camera
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pan camera
    if (cam.updatePan(e.clientX, e.clientY)) {
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Drag node (with camera)
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    if (dragRef.current) {
      const world = cam.screenToWorld(sx, sy);
      const node = simRef.current.get(dragRef.current.id);
      if (node) {
        node.x = world.x - dragRef.current.offsetX;
        node.y = world.y - dragRef.current.offsetY;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    // Hover detection with camera
    const world = cam.screenToWorld(sx, sy);
    let nearest: string | null = null;
    let minDist = Infinity;
    simRef.current.forEach((node) => {
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist < node.radius + 10 && dist < minDist) { minDist = dist; nearest = node.id; }
    });

    if (nearest !== hoveredRef.current) {
      hoveredRef.current = nearest;
      const node = nearest ? simRef.current.get(nearest) ?? null : null;
      onNodeHover(node);
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
    }
  }, [onNodeHover, cam]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = cam.screenToWorld(sx, sy);

    // Try to drag a node
    const found = Array.from(simRef.current.values()).find((n) => {
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
    });
    if (found) {
      dragRef.current = { id: found.id, offsetX: 0, offsetY: 0 };
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Otherwise start panning
    cam.startPan(e.clientX, e.clientY);
    canvas.style.cursor = 'grabbing';
  }, [cam]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    cam.endPan();
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
  }, [cam]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cam.wasDrag(e.clientX, e.clientY)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = cam.screenToWorld(sx, sy);
    const found = Array.from(simRef.current.values()).find((n) => {
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
    });
    if (found && found.id !== 'me') onNodeClick(found);
  }, [onNodeClick, cam]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    cam.handleWheel(e, canvasRef.current);
  }, [cam]);

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
        className="cursor-grab active:cursor-grabbing"
      />

      </div>
  );
}
