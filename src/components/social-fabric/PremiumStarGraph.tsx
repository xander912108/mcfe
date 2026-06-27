import { useRef, useEffect, useCallback, useMemo } from 'react';
import { drawNodeAvatar } from '@/hooks/useNodeAvatars';
import { useCamera } from '@/hooks/useCamera';
import type { GraphNode, GraphEdge, BridgeContext } from '@/data/graphData';

// Activity freshness helpers
function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date('2026-06-17');
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function isRecent(dateStr: string, days: number = 7): boolean {
  return daysSince(dateStr) <= days;
}

function isStale(dateStr: string, days: number = 30): boolean {
  return daysSince(dateStr) > days;
}

interface PremiumStarGraphProps {
  centerNode: GraphNode;
  connectedNodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  onBridgeHover?: (bridge: BridgeContext | null) => void;
  onHoverScreenPos?: (pos: { x: number; y: number } | null) => void;
  highlightNodeId?: string | null;
  highlightNodeIds?: Set<string> | null;
  dimOpacity?: number;
  mode: 'participant' | 'leader';
  width: number;
  height: number;
  centerLabel?: string;
  centerSubtitle?: string;
  focusMode?: boolean;
  bridgeContexts?: BridgeContext[];
  darkMode?: boolean;
  camera?: ReturnType<typeof useCamera>;
}

interface RenderNode extends GraphNode {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  pulseOffset: number; // individual breathing offset in ms (0–5000)
}

const drawPremiumSignal = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  // Glow
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fillStyle = color + '30';
  ctx.fill();
  // Core fill
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

// Draw dark stroke ON TOP of circle border for visibility
const drawSignalStroke = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, Math.PI * 2);
  ctx.strokeStyle = '#141416';
  ctx.lineWidth = 2.5;
  ctx.stroke();
};

// PREMIUM COLOR PALETTE — Gold Theme with dark/light mode
function getColors(dark: boolean) {
  return {
    bg: dark ? '#141416' : '#FAFAF8',
    bgGradient: dark ? ['#151310', '#0E0D0B', '#0A0908'] : ['#F3EFE8', '#EDE9E0', '#E8E3D8'],
    center: {
      fill: dark ? '#5a4a2a' : '#8a7a4a',
      glow: dark ? 'rgba(201, 169, 110, 0.35)' : 'rgba(201, 169, 110, 0.25)',
      pulse: dark ? 'rgba(212, 184, 122, 0.15)' : 'rgba(201, 169, 110, 0.12)',
      text: '#ffffff',
      border: '#C9A96E',
    },
    nodes: {
      online: { fill: dark ? '#3a3020' : '#f5efe3', glow: dark ? 'rgba(201, 169, 110, 0.5)' : 'rgba(201, 169, 110, 0.4)', border: '#C9A96E' },
      offline: { fill: dark ? '#1c1c1f' : '#f0eeea', glow: dark ? 'rgba(120, 113, 108, 0.15)' : 'rgba(120, 113, 108, 0.1)', border: dark ? '#4a4a4e' : '#c8c5bf' },
      stuck: { fill: '#3c2a1e', glow: 'rgba(237, 137, 54, 0.25)', border: '#ed8936' },
      burnout: { fill: '#3c1e1e', glow: 'rgba(245, 101, 101, 0.2)', border: '#f56565' },
    },
    edges: {
      help: dark ? '#7a8faf' : '#5a7f9f',
      review: '#6B9E7C',
      flow: '#ed8936',
      mentorship: '#B89cc0',
      gratitude: '#ecc94b',
      mutual: '#38b2ac',
      default: dark ? '#2a2a2e' : '#d8d5cf',
      decaying: dark ? '#1a1a1e' : '#e8e5df',
    },
    text: {
      primary: dark ? '#E8E6E3' : '#1A1A1A',
      secondary: dark ? '#9A9895' : '#666666',
      muted: dark ? '#6A6865' : '#999999',
      accent: '#C9A96E',
    },
    roleColors: {
      'Помощник по практике': '#C9A96E',
      'Помощник на старт': '#B89cc0',
      'Хранитель знаний': '#d69e2e',
      'Куратор': '#ed64a6',
      'Связующий': '#6B9E7C',
      default: dark ? '#6A6865' : '#999999',
    } as Record<string, string>,
  };
}

export function PremiumStarGraph({
  centerNode,
  connectedNodes,
  edges,
  onNodeHover,
  onNodeClick,
  onBridgeHover,
  onHoverScreenPos,
  highlightNodeId,
  highlightNodeIds,
  dimOpacity = 0.2,
  mode,
  bridgeContexts,
  width,
  height,
  centerLabel,
  darkMode = true,
  camera: externalCamera,
}: PremiumStarGraphProps) {
  const COLORS = useMemo(() => getColors(darkMode), [darkMode]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, RenderNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const timeRef = useRef(0);

  // Camera: pan + zoom — use external if provided, else internal
  const internalCameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const cameraRef = externalCamera?.cameraRef ?? internalCameraRef;
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const cameraStartRef = useRef({ x: 0, y: 0 });

  // Initialize node positions
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;

    const centerRn: RenderNode = {
      ...centerNode,
      x: cx,
      y: cy,
      targetX: cx,
      targetY: cy,
      radius: 38,
      opacity: 0,
      pulsePhase: 0,
      pulseOffset: 0,
    };
    nodesRef.current.set(centerNode.id, centerRn);

    // Golden spiral layout: strong ties closer to center, weak further out
    // Scales infinitely — no overlap guarantee via adaptive spacing
    const nodeR = 26;
    const count = connectedNodes.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5° — sunflower pattern
    const maxCanvasR = Math.min(width, height) * 0.42;
    // Adaptive innerR: scales with canvas but never exceeds 120
    const innerR = Math.min(120, maxCanvasR * 0.35);
    const defaultSpacing = 42;
    // Minimum spacing = node diameter + padding to prevent overlap
    const minSpacing = nodeR * 2.5; // 65px for 26px radius
    // Adaptive spacing: ensure last node fits within canvas, but never below minSpacing
    const adaptiveSpacing = count > 1
      ? Math.max(minSpacing, Math.min(defaultSpacing, (maxCanvasR - innerR) / Math.sqrt(count - 1)))
      : defaultSpacing;
    // If canvas is too small, shrink nodes to fit
    const finalNodeR = maxCanvasR < innerR + minSpacing ? Math.max(14, (maxCanvasR - innerR) / 3) : nodeR;

    // Sort by weight descending: strong ties first (closer to center)
    const sortedNodes = [...connectedNodes].sort((a, b) => {
      const edgeA = edges.find((e) => (e.source === centerNode.id && e.target === a.id) || (e.target === centerNode.id && e.source === a.id));
      const edgeB = edges.find((e) => (e.source === centerNode.id && e.target === b.id) || (e.target === centerNode.id && e.source === b.id));
      return (edgeB?.weight ?? 0) - (edgeA?.weight ?? 0);
    });

    sortedNodes.forEach((node, i) => {
      const r = Math.min(maxCanvasR - finalNodeR - 12, innerR + adaptiveSpacing * Math.sqrt(i));
      const angle = i * goldenAngle - Math.PI / 2;

      const existing = nodesRef.current.get(node.id);
      nodesRef.current.set(node.id, {
        ...node,
        x: existing?.x ?? cx,
        y: existing?.y ?? cy,
        targetX: cx + r * Math.cos(angle),
        targetY: cy + r * Math.sin(angle),
        radius: finalNodeR,
        opacity: existing?.opacity ?? 0,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseOffset: existing?.pulseOffset ?? Math.random() * 5000,
      });
    });
  }, [centerNode, connectedNodes, edges, width, height]);

  // Animation loop
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
      timeRef.current = ts;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // PREMIUM BACKGROUND
      // Deep gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, COLORS.bgGradient[0]);
      bgGrad.addColorStop(0.5, COLORS.bgGradient[1]);
      bgGrad.addColorStop(1, COLORS.bgGradient[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Apply camera transform
      const cam = cameraRef.current;
      ctx.save();
      ctx.translate(cam.x + width / 2, cam.y + height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-width / 2, -height / 2);

      // Subtle noise texture dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      for (let i = 0; i < 60; i++) {
        const nx = ((Math.sin(i * 127.1 + timeRef.current * 0.0001) + 1) / 2) * width;
        const ny = ((Math.cos(i * 311.7 + timeRef.current * 0.0002) + 1) / 2) * height;
        const nr = 0.5 + Math.sin(i) * 0.5;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
      }

      const center = nodesRef.current.get(centerNode.id);

      // Ambient glow behind center
      if (center) {
        const ambientGlow = ctx.createRadialGradient(
          center.x, center.y, 0,
          center.x, center.y, 180
        );
        ambientGlow.addColorStop(0, 'rgba(201, 169, 110, 0.08)');
        ambientGlow.addColorStop(0.5, 'rgba(166, 139, 82, 0.04)');
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(center.x - 200, center.y - 200, 400, 400);
      }

      // Draw EDGES (behind nodes) — TWO-PASS: solid first, then dashed on top
      const renderEdge = (edge: GraphEdge, isDashed: boolean) => {
        const src = nodesRef.current.get(edge.source);
        const tgt = nodesRef.current.get(edge.target);
        if (!src || !tgt) return;

        const isHovered = hoveredRef.current === edge.source || hoveredRef.current === edge.target;
        const isHighlighted = highlightNodeId === edge.source || highlightNodeId === edge.target;
        const isCenterEdge = edge.source === 'me' || edge.target === 'me';

        // Edge styling — brightness based on lastInteraction freshness
        const edgeColor = COLORS.edges[edge.type as keyof typeof COLORS.edges] || COLORS.edges.default;
        const recent = isRecent(edge.lastInteraction, 7);
        const stale = isStale(edge.lastInteraction, 30);

        let edgeOpacity: number;
        let lineWidth: number;

        if (isHovered || isHighlighted) {
          edgeOpacity = 0.95;
          lineWidth = Math.max(1.5, edge.weight * 0.45);
        } else if (recent) {
          edgeOpacity = 0.85; // fresh — bright
          lineWidth = Math.max(1.0, edge.weight * 0.35);
        } else if (stale) {
          edgeOpacity = 0.3; // stale — faint
          lineWidth = Math.max(0.5, edge.weight * 0.2);
        } else {
          edgeOpacity = isCenterEdge ? 0.55 : 0.35; // normal
          lineWidth = Math.max(0.6, edge.weight * 0.25);
        }

        // Skip dashed edges in solid pass, skip solid edges in dashed pass
        const shouldBeDashed = edge.weight <= 1;
        if (isDashed !== shouldBeDashed) return;

        ctx.save();

        // Curved bezier control point
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        const curvature = 0.12;
        const cpx = mx + (tgt.y - src.y) * curvature;
        const cpy = my - (tgt.x - src.x) * curvature;

        // Arrow tip at edge of target node
        const isDirected = edge.type !== 'mutual' && edge.type !== 'flow';
        let arrowX = tgt.x;
        let arrowY = tgt.y;
        let arrowAngle = 0;
        if (isDirected) {
          const distToEdge = tgt.radius + 3;
          let tLow = 0.5, tHigh = 1.0;
          for (let i = 0; i < 12; i++) {
            const t = (tLow + tHigh) / 2;
            const t1 = 1 - t;
            const px = t1 * t1 * src.x + 2 * t1 * t * cpx + t * t * tgt.x;
            const py = t1 * t1 * src.y + 2 * t1 * t * cpy + t * t * tgt.y;
            const d = Math.hypot(px - tgt.x, py - tgt.y);
            if (d < distToEdge) tHigh = t;
            else tLow = t;
          }
          const tArrow = (tLow + tHigh) / 2;
          const t1a = 1 - tArrow;
          const baseX = t1a * t1a * src.x + 2 * t1a * tArrow * cpx + tArrow * tArrow * tgt.x;
          const baseY = t1a * t1a * src.y + 2 * t1a * tArrow * cpy + tArrow * tArrow * tgt.y;
          arrowAngle = Math.atan2(tgt.y - baseY, tgt.x - baseX);
          arrowX = tgt.x - distToEdge * Math.cos(arrowAngle);
          arrowY = tgt.y - distToEdge * Math.sin(arrowAngle);
        }
        const lineEndX = isDirected ? arrowX : tgt.x;
        const lineEndY = isDirected ? arrowY : tgt.y;

        if (isDashed) {
          // DASHED PASS: uniform muted color for all potential connections
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = 'rgba(154, 152, 149, 0.5)';
          ctx.lineWidth = Math.max(1.2, lineWidth);
        } else {
          // SOLID PASS: gradient for premium look
          ctx.setLineDash([]);
          ctx.globalAlpha = edgeOpacity;
          const lineGrad = ctx.createLinearGradient(src.x, src.y, lineEndX, lineEndY);
          const alphaHex = Math.floor(edgeOpacity * 200).toString(16).padStart(2, '0');
          lineGrad.addColorStop(0, edgeColor + '00');
          lineGrad.addColorStop(0.25, edgeColor + alphaHex);
          lineGrad.addColorStop(0.75, edgeColor + alphaHex);
          lineGrad.addColorStop(1, edgeColor + '00');
          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = lineWidth;
        }

        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(cpx, cpy, lineEndX, lineEndY);
        ctx.stroke();

        // Arrowhead for directed edges
        if (isDirected) {
          const arrowLen = isHovered ? 12 : 9;
          ctx.globalAlpha = isDashed ? 0.4 : edgeOpacity;
          ctx.fillStyle = isDashed ? '#9A9895' : edgeColor;
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowLen * Math.cos(arrowAngle - 0.4),
            arrowY - arrowLen * Math.sin(arrowAngle - 0.4)
          );
          ctx.lineTo(
            arrowX - arrowLen * Math.cos(arrowAngle + 0.4),
            arrowY - arrowLen * Math.sin(arrowAngle + 0.4)
          );
          ctx.closePath();
          ctx.fill();

          if (isHovered) {
            ctx.globalAlpha = (isDashed ? 0.25 : edgeOpacity) * 0.3;
            ctx.beginPath();
            ctx.arc(arrowX, arrowY, 6, 0, Math.PI * 2);
            ctx.fillStyle = isDashed ? '#9A9895' : edgeColor;
            ctx.fill();
          }
        }

        ctx.restore();
      };

      // Pass 1: solid edges (weight >= 3)
      edges.forEach((edge) => renderEdge(edge, false));
      // Pass 2: dashed edges (weight <= 1) — real edges, drawn ON TOP
      edges.forEach((edge) => renderEdge(edge, true));

      // Pass 3: dashed edges for potential nodes (no direct edge to center)
      // These are people in bridgeContexts — "connection can be created"
      connectedNodes.forEach((node) => {
        if (node.id === centerNode.id) return;
        const hasEdge = edges.some(
          (e) => (e.source === centerNode.id && e.target === node.id) ||
                 (e.target === centerNode.id && e.source === node.id)
        );
        if (!hasEdge) {
          // Draw dashed line from center to this potential node
          const rn = nodesRef.current.get(node.id);
          if (!rn) return;
          const cn = nodesRef.current.get(centerNode.id);
          if (!cn) return;

          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = 'rgba(154, 152, 149, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cn.x, cn.y);
          ctx.lineTo(rn.x, rn.y);
          ctx.stroke();

          // Small arrow at node end
          const angle = Math.atan2(rn.y - cn.y, rn.x - cn.x);
          const arrowLen = 9;
          const arrowX = rn.x - (rn.radius + 3) * Math.cos(angle);
          const arrowY = rn.y - (rn.radius + 3) * Math.sin(angle);
          ctx.fillStyle = '#9A9895';
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - arrowLen * Math.cos(angle - 0.4), arrowY - arrowLen * Math.sin(angle - 0.4));
          ctx.lineTo(arrowX - arrowLen * Math.cos(angle + 0.4), arrowY - arrowLen * Math.sin(angle + 0.4));
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw NODES
      const signalStrokes: { x: number; y: number }[] = [];
      nodesRef.current.forEach((node) => {
        // Smooth interpolation
        node.x += (node.targetX - node.x) * 0.07;
        node.y += (node.targetY - node.y) * 0.07;
        node.opacity = Math.min(1, node.opacity + 0.015);

        const isCenter = node.id === centerNode.id;
        const isHovered = hoveredRef.current === node.id;
        const isHoverDimmed = hoveredRef.current && hoveredRef.current !== node.id && hoveredRef.current !== centerNode.id;
        // Filter dim: if highlightNodeIds is set and node is NOT in it — dim it
        const isFilterDimmed = highlightNodeIds && !highlightNodeIds.has(node.id) && !isCenter;

        ctx.save();
        ctx.globalAlpha = isHoverDimmed ? 0.2 : isFilterDimmed ? dimOpacity : node.opacity;

        // Determine node color scheme
        let nodeScheme = COLORS.nodes.offline;
        if (isCenter) {
          nodeScheme = COLORS.center;
        } else if (node.status === 'stuck') {
          nodeScheme = COLORS.nodes.stuck;
        } else if (node.status === 'burnout_risk') {
          nodeScheme = COLORS.nodes.burnout;
        } else if (node.isOnline) {
          nodeScheme = COLORS.nodes.online;
        }

        // ONLINE indicator — bright thin ring outside circle, drawn AFTER body so it's visible
        // (actual draw happens after node body, see below)

        // CENTER NODE: Premium multi-ring glow
        if (isCenter) {
          // Outer ring
          const outerPulse = Math.sin(ts * 0.0012) * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 12 + outerPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.18)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Middle ring
          const midPulse = Math.sin(ts * 0.0018 + 1) * 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6 + midPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // HOVER RING + TOOLTIP (Level 3)
        if (isHovered && !isCenter) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Find most recent interaction date
          const nodeEdges = edges.filter(
            (e) => (e.source === node.id && e.target === centerNode.id) ||
                   (e.target === node.id && e.source === centerNode.id)
          );
          const mostRecent = nodeEdges
            .map((e) => e.lastInteraction)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

          if (mostRecent) {
            const recent = isRecent(mostRecent, 7);
            const tooltipY = node.y - node.radius - 14;
            const label = recent ? 'Недавно' : 'Последнее';
            const text = `${label}: ${mostRecent}`;

            ctx.font = '9px Inter, system-ui, sans-serif';
            const textWidth = ctx.measureText(text).width;
            const pad = 5;

            // Pill background
            ctx.beginPath();
            ctx.roundRect(node.x - textWidth / 2 - pad, tooltipY - 8, textWidth + pad * 2, 14, 3);
            ctx.fillStyle = 'rgba(20, 20, 22, 0.95)';
            ctx.fill();

            // Text
            ctx.fillStyle = recent ? '#C9A96E' : '#9A9895'; // gold for recent, muted for older
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, node.x, tooltipY - 1);
          }
        }

        // OREOL — steady bright gold glow around high-value nodes
        // Constant intensity, sits just outside the node circle.
        if (!isCenter) {
          const nodeEdges = edges.filter(
            (e) => (e.source === node.id && e.target === centerNode.id) ||
                   (e.target === node.id && e.source === centerNode.id)
          );
          const hasStrongEdge = nodeEdges.some((e) => e.weight >= 7);
          if (hasStrongEdge) {
            const oreolR = node.radius + 11; // ~10–12 px beyond node edge
            const oreolGrad = ctx.createRadialGradient(
              node.x, node.y, node.radius * 0.80,
              node.x, node.y, oreolR
            );
            oreolGrad.addColorStop(0, 'rgba(201, 169, 110, 0.65)');
            oreolGrad.addColorStop(0.5, 'rgba(201, 169, 110, 0.30)');
            oreolGrad.addColorStop(1, 'rgba(201, 169, 110, 0)');
            ctx.fillStyle = oreolGrad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, oreolR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // NODE CIRCLE BACKGROUND
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (isCenter) {
          // Center: deep gold gradient
          const centerGrad = ctx.createRadialGradient(
            node.x - 6, node.y - 6, 2,
            node.x, node.y, node.radius
          );
          centerGrad.addColorStop(0, '#7a6a3a');
          centerGrad.addColorStop(1, '#4a3f20');
          ctx.fillStyle = centerGrad;
        } else {
          const nodeGrad = ctx.createRadialGradient(
            node.x - 4, node.y - 4, 1,
            node.x, node.y, node.radius
          );
          nodeGrad.addColorStop(0, nodeScheme.fill);
          nodeGrad.addColorStop(1, '#0f1720');
          ctx.fillStyle = nodeGrad;
        }
        ctx.fill();

        // NODE SHADOW (beneath)
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(node.x + 2, node.y + 3, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
        ctx.restore();

        // Re-fill on top
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (isCenter) {
          const cg = ctx.createRadialGradient(node.x - 6, node.y - 6, 2, node.x, node.y, node.radius);
          cg.addColorStop(0, '#7a6a3a');
          cg.addColorStop(1, '#3a3020');
          ctx.fillStyle = cg;
        } else {
          const ng = ctx.createRadialGradient(node.x - 4, node.y - 4, 1, node.x, node.y, node.radius);
          ng.addColorStop(0, nodeScheme.fill);
          ng.addColorStop(1, '#0f1720');
          ctx.fillStyle = ng;
        }
        ctx.fill();

        // BORDER — edge type color (if connected), else role color, else status color
        const edgeToNode = !isCenter ? edges.find(
          (e) => (e.source === centerNode.id && e.target === node.id) ||
                 (e.target === centerNode.id && e.source === node.id)
        ) : null;
        const edgeTypeColor = edgeToNode ? (COLORS.edges[edgeToNode.type as keyof typeof COLORS.edges] || null) : null;
        const borderColor = isCenter
          ? '#C9A96E'
          : edgeTypeColor
          ? edgeTypeColor
          : node.role
          ? COLORS.roleColors[node.role] || COLORS.roleColors.default
          : nodeScheme.border;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isCenter ? 2.5 : 1.8;
        ctx.stroke();

        // Recent activity glow removed — line style (solid/dashed) is sufficient

        // ONLINE breathing — interval pulse with individual offset
        // Cycle: 5s total, 2s pulse, 3s pause. Each node has unique offset.
        if (node.isOnline && !isCenter) {
          const CYCLE = 5000;       // ms full cycle
          const PULSE_DURATION = 2000; // ms active pulse
          const t = (ts + node.pulseOffset) % CYCLE;

          if (t < PULSE_DURATION) {
            const phase = t / PULSE_DURATION;           // 0→1 within pulse
            const envelope = Math.sin(phase * Math.PI) ** 2; // sin²: soft inhale-exhale
            const alpha = envelope * 0.85;              // max opacity 0.85
            const radius1 = node.radius + 3 + envelope * 2;
            const radius2 = node.radius + 5 + envelope * 3;

            // Primary ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius1, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Echo ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // CENTER TEXT
        if (isCenter) {
          const label = centerLabel || 'Я';
          ctx.fillStyle = COLORS.center.text;
          ctx.font = label.length > 2 ? 'bold 12px Inter, system-ui, sans-serif' : 'bold 15px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y);

          // Subtitle below center node intentionally hidden
        } else {
          // AVATAR — circular gradient placeholder with initials (photo-ready)
          drawNodeAvatar(ctx, node.x, node.y, node.radius * 0.92, node.id, node.name, node.avatar);
        }

        // Leader SIGNALS — drawn ON TOP of avatar so they're fully visible
        // Positions: burnout = top-left (-135°), stuck = bottom-left (+135°)
        if (mode === 'leader' && !isCenter) {
          const hasStuck = node.status === 'stuck';
          const hasBurnout = node.status === 'burnout_risk';
          const signalDist = node.radius; // center ON the circle line
          const sigPositions: { a: number; color: string }[] = [];

          if (hasBurnout) sigPositions.push({ a: -Math.PI * 3 / 4, color: '#f56565' }); // top-left -135°
          if (hasStuck) sigPositions.push({ a: Math.PI * 3 / 4, color: '#ed8936' });    // bottom-left +135°

          sigPositions.forEach(({ a, color }) => {
            const sx = node.x + signalDist * Math.cos(a);
            const sy = node.y + signalDist * Math.sin(a);
            drawPremiumSignal(ctx, sx, sy, color);
            signalStrokes.push({ x: sx, y: sy });
          });
        }

        // "Help ready" badge
        if (node.isHelpReady && !isCenter) {
          const bx = node.x + node.radius * 0.7;
          const by = node.y - node.radius * 0.7;

          // Badge glow — gold to match theme
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(201, 169, 110, 0.35)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#C9A96E';
          ctx.fill();
          ctx.strokeStyle = '#141416';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Labels — show role only (name shown in sidebar card on click)
        const showLabels = isCenter || cameraRef.current.zoom > 1.1;

        if (showLabels) {
          // NAME — all nodes except center ("Я")
          if (!isCenter) {
            const nameFont = '10px Inter, system-ui, sans-serif';
            ctx.font = nameFont;
            const nameWidth = ctx.measureText(node.name).width;
            const namePadding = 4;
            const nameY = node.y + node.radius + 14;

            // Pill background
            ctx.beginPath();
            ctx.roundRect(node.x - nameWidth / 2 - namePadding, nameY - 8, nameWidth + namePadding * 2, 14, 3);
            ctx.fillStyle = isHovered ? 'rgba(10, 14, 30, 0.92)' : 'rgba(8, 12, 26, 0.85)';
            ctx.fill();

            // Name text
            ctx.fillStyle = isHovered ? '#ffffff' : '#9A9895';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.name, node.x, nameY);
          }

          // ROLE LABEL
          if (node.role && !isCenter) {
            const roleFont = '8px Inter, system-ui, sans-serif';
            ctx.font = roleFont;
            const roleWidth = ctx.measureText(node.role).width;
            const rolePadding = 3;
            const roleY = node.y + node.radius + 32;

            // Pill background
            ctx.beginPath();
            ctx.roundRect(node.x - roleWidth / 2 - rolePadding, roleY - 6, roleWidth + rolePadding * 2, 12, 3);
            const roleColor = COLORS.roleColors[node.role] || COLORS.roleColors.default;
            ctx.fillStyle = roleColor + '20';
            ctx.fill();
            ctx.strokeStyle = roleColor + '35';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Role text
            ctx.fillStyle = roleColor + 'cc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.role, node.x, roleY);
          }

          // Center node label intentionally hidden — shown as initials in circle only
        }

        ctx.restore();
      });

      // Draw signal strokes ON TOP of all circle borders for dark outline visibility
      signalStrokes.forEach(({ x, y }) => {
        drawSignalStroke(ctx, x, y);
      });

      ctx.restore(); // end camera transform

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [centerNode, edges, width, height, mode, highlightNodeId, cameraRef, centerLabel, connectedNodes, dimOpacity, highlightNodeIds, COLORS]);

  // Draw signal glow+core (stroke drawn separately AFTER circle border)
  // Convert screen coords to world coords (with camera)
  const screenToWorld = (sx: number, sy: number) => {
    const cam = cameraRef.current;
    const cx = width / 2;
    const cy = height / 2;
    return {
      x: (sx - cx - cam.x) / cam.zoom + cx,
      y: (sy - cy - cam.y) / cam.zoom + cy,
    };
  };

  // Mouse handlers with camera support
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const cam = cameraRef.current;
    const worldBefore = screenToWorld(sx, sy);

    // Zoom factor
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3.0, cam.zoom * delta));

    // Adjust pan so world point under mouse stays fixed
    const cx = width / 2;
    const cy = height / 2;
    cam.x = sx - cx - (worldBefore.x - cx) * newZoom;
    cam.y = sy - cy - (worldBefore.y - cy) * newZoom;
    cam.zoom = newZoom;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    cameraStartRef.current = { ...cameraRef.current };
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Pan mode
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        cameraRef.current.x = cameraStartRef.current.x + dx;
        cameraRef.current.y = cameraStartRef.current.y + dy;
        return;
      }

      // Hover detection with camera
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const world = screenToWorld(mx, my);

      let nearest: string | null = null;
      let minDist = Infinity;
      nodesRef.current.forEach((node) => {
        const dist = Math.hypot(node.x - world.x, node.y - world.y);
        if (dist < node.radius + 10 && dist < minDist) {
          minDist = dist;
          nearest = node.id;
        }
      });

      // Check dashed edge hover for bridge tooltip
      let hoveredBridge: BridgeContext | null = null;
      if (!nearest && onBridgeHover && bridgeContexts) {
        edges.forEach((edge) => {
          if (edge.weight > 2) return; // Only dashed edges
          const src = nodesRef.current.get(edge.source);
          const tgt = nodesRef.current.get(edge.target);
          if (!src || !tgt) return;
          // Distance from point to line segment
          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const len = Math.hypot(dx, dy);
          if (len === 0) return;
          const t = Math.max(0, Math.min(1, ((world.x - src.x) * dx + (world.y - src.y) * dy) / (len * len)));
          const projX = src.x + t * dx;
          const projY = src.y + t * dy;
          const dist = Math.hypot(world.x - projX, world.y - projY);
          if (dist < 15) {
            const bridge = bridgeContexts.find((b) => b.targetId === edge.target || b.targetId === edge.source);
            if (bridge) hoveredBridge = bridge;
          }
        });
      }
      onBridgeHover?.(hoveredBridge);

      if (nearest !== hoveredRef.current) {
        hoveredRef.current = nearest;
        const node = nearest ? nodesRef.current.get(nearest) ?? null : null;
        onNodeHover(node);
        if (node && onHoverScreenPos) {
          const cam = cameraRef.current;
          const sx = (node.x - width / 2) * cam.zoom + width / 2 + cam.x;
          const sy = (node.y - height / 2) * cam.zoom + height / 2 + cam.y;
          onHoverScreenPos({ x: sx, y: sy });
        } else {
          onHoverScreenPos?.(null);
        }
        canvas.style.cursor = nearest ? 'pointer' : hoveredBridge ? 'help' : 'grab';
      }
  };

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grab';
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      // If camera moved significantly, treat as pan not click
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      if (Math.hypot(dx, dy) > 5) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const world = screenToWorld(mx, my);

      const allNodes = Array.from(nodesRef.current.values());
      const found = allNodes.find((n) => {
        const dist = Math.hypot(n.x - world.x, n.y - world.y);
        return dist < n.radius + 10;
      });

      if (found && found.id !== 'me') {
        onNodeClick(found);
      }
  };

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
