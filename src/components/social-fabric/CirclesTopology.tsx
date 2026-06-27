import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { drawNodeAvatar } from '@/hooks/useNodeAvatars';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface CirclesTopologyProps {
  centerNode: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  onRingClick?: (ringIndex: number) => void;
  onHoverScreenPos?: (pos: { x: number; y: number } | null) => void;
  highlightNodeId?: string | null;
  highlightNodeIds?: Set<string> | null;
  dimOpacity?: number;
  width: number;
  height: number;
  focusMode?: boolean;
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
  pulseOffset: number;
  ringIndex: number;
  ringLabel: string;
}

const RING_CONFIG = [
  { label: 'Опоры', desc: 'Устойчивые связи: можно попросить совет.', color: '#C9A96E', bg: 'rgba(201,169,110,0.10)', strokeAlpha: 'bb', fillAlpha: '18' },
  { label: 'Близкие', desc: 'Тёплые связи — написать, продолжить контакт.', color: '#B89cc0', bg: 'rgba(184,156,192,0.08)', strokeAlpha: 'aa', fillAlpha: '14' },
  { label: 'Коллеги', desc: 'Общий контекст — обменяться опытом.', color: '#6B9E7C', bg: 'rgba(107,158,124,0.07)', strokeAlpha: '99', fillAlpha: '12' },
  { label: 'Знакомые', desc: 'Слабая связь — мягко оживить.', color: '#9A9895', bg: 'rgba(154,152,149,0.06)', strokeAlpha: '88', fillAlpha: '10' },
  { label: 'Потенциальные', desc: 'Связи ещё нет — познакомиться.', color: '#787673', bg: 'rgba(120,118,115,0.05)', strokeAlpha: '66', fillAlpha: '0c' },
];

function getColors(dark: boolean) {
  return {
    bgGradient: dark ? ['#151310', '#0E0D0B', '#0A0908'] : ['#F3EFE8', '#EDE9E0', '#E8E3D8'],
    center: { fill: dark ? '#5a4a2a' : '#8a7a4a', text: '#ffffff', border: '#C9A96E' },
    nodes: {
      online: { fill: dark ? '#3a3020' : '#f5efe3', border: '#C9A96E' },
      offline: { fill: dark ? '#1c1c1f' : '#f0eeea', border: dark ? '#4a4a4e' : '#c8c5bf' },
    },
    roleColors: {
      'Помощник по практике': '#C9A96E', 'Помощник на старт': '#B89cc0',
      'Хранитель знаний': '#d69e2e', 'Куратор': '#ed64a6',
      'Связующий': '#6B9E7C', default: dark ? '#6A6865' : '#999999',
    } as Record<string, string>,
  };
}

function getRingIndexByWeight(weight: number): number {
  if (weight >= 7) return 0;      // Опоры
  if (weight >= 5) return 1;      // Близкие
  if (weight >= 3) return 2;      // Коллеги
  if (weight >= 1) return 3;      // Знакомые
  return 4;                       // Потенциальные (weight 0 or no edge)
}

function getNodeRadius(contributionLevel: number): number {
  if (contributionLevel >= 7) return 28;
  if (contributionLevel >= 4) return 24;
  if (contributionLevel >= 2) return 21;
  return 17;
}

export function CirclesTopology({
  centerNode, nodes, edges, onNodeHover, onNodeClick, onHoverScreenPos,
  highlightNodeId, highlightNodeIds, dimOpacity = 0.2, width, height,
  darkMode = true, camera: externalCamera,
}: CirclesTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, RenderNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const ringNodesRef = useRef<string[][]>([[], [], [], [], []]);

  const COLORS = getColors(darkMode);
  const internalCam = useCamera(width, height, 0.82);
  const cam = externalCamera ?? internalCam;

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;
  // Fixed ring radii — always 5 visible rings
  const ringRadii = useMemo(() => [maxR * 0.18, maxR * 0.36, maxR * 0.55, maxR * 0.75, maxR * 0.94], [maxR]);

  // Distribute nodes into rings based on their max edge weight to center
  useEffect(() => {
    // Build map: nodeId -> max weight connecting to center
    const nodeMaxWeight = new Map<string, number>();
    edges.forEach((e) => {
      const isToCenter = e.source === centerNode.id || e.target === centerNode.id;
      if (!isToCenter) return;
      const otherId = e.source === centerNode.id ? e.target : e.source;
      if (otherId === centerNode.id) return;
      const current = nodeMaxWeight.get(otherId) ?? -1;
      if (e.weight > current) nodeMaxWeight.set(otherId, e.weight);
    });

    // Distribute ALL nodes into 5 rings
    const ringPositions: string[][] = [[], [], [], [], []];
    nodes.forEach((node) => {
      const weight = nodeMaxWeight.get(node.id) ?? -1;
      const ri = weight < 0 ? 4 : getRingIndexByWeight(weight);
      ringPositions[ri].push(node.id);
    });
    ringNodesRef.current = ringPositions;

    // Place center node
    const centerRn: RenderNode = {
      ...centerNode, x: cx, y: cy, targetX: cx, targetY: cy,
      radius: 34, opacity: 1, pulsePhase: 0, pulseOffset: 0, ringIndex: -1, ringLabel: '',
    };
    nodesRef.current.set(centerNode.id, centerRn);

    // Place nodes in their rings
    ringPositions.forEach((nodeIds, ri) => {
      nodeIds.forEach((nid, i) => {
        const node = nodes.find((n) => n.id === nid);
        if (!node) return;
        const baseRadius = getNodeRadius(node.contributionLevel);
        const safeGap = baseRadius * 2 + 16;
        const baseR = ringRadii[ri];
        const circumference = Math.max(1, 2 * Math.PI * baseR);
        const lanes = Math.max(1, Math.ceil((nodeIds.length * safeGap) / circumference));
        const lane = lanes === 1 ? 0 : i % lanes;
        const laneOffset = (lane - (lanes - 1) / 2) * (safeGap * 0.72);
        const innerLimit = ri > 0 ? ringRadii[ri - 1] + safeGap : ringRadii[0] * 0.42;
        const outerLimit = ri < ringRadii.length - 1 ? ringRadii[ri + 1] - safeGap : maxR - baseRadius - 8;
        const r = Math.min(Math.max(baseR + laneOffset, innerLimit), Math.max(innerLimit, outerLimit));
        const angle = (2 * Math.PI * i) / Math.max(nodeIds.length, 1) - Math.PI / 2 + lane * 0.12;
        const existing = nodesRef.current.get(nid);
        nodesRef.current.set(nid, {
          ...node,
          x: existing?.x ?? cx + r * 0.5 * Math.cos(angle),
          y: existing?.y ?? cy + r * 0.5 * Math.sin(angle),
          targetX: cx + r * Math.cos(angle),
          targetY: cy + r * Math.sin(angle),
          radius: baseRadius,
          opacity: existing?.opacity ?? 0,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseOffset: Math.random() * 5000,
          ringIndex: ri,
          ringLabel: RING_CONFIG[ri].label,
        });
      });
    });
  }, [centerNode, nodes, edges, cx, cy, ringRadii, maxR]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const animate = (ts: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, COLORS.bgGradient[0]);
      bgGrad.addColorStop(0.5, COLORS.bgGradient[1]);
      bgGrad.addColorStop(1, COLORS.bgGradient[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      cam.applyTransform(ctx);

      // ─── ALL 5 RINGS (always visible) ───
      ringRadii.forEach((r, i) => {
        const cfg = RING_CONFIG[i];
        const nodeCount = ringNodesRef.current[i]?.length ?? 0;

        // 1. Fill band — brighter
        const prevR = i > 0 ? ringRadii[i - 1] : ringRadii[0] * 0.35;
        const bandGrad = ctx.createRadialGradient(cx, cy, prevR, cx, cy, r);
        bandGrad.addColorStop(0, cfg.color + cfg.fillAlpha);
        bandGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bandGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (i > 0) ctx.arc(cx, cy, prevR, 0, Math.PI * 2, true);
        else ctx.arc(cx, cy, ringRadii[0] * 0.35, 0, Math.PI * 2, true);
        ctx.fill();

        // 2. Ring circle line — thicker, brighter
        const pulse = Math.sin(ts * 0.0008 + i * 1.2) * 1.5;
        ctx.strokeStyle = cfg.color + (darkMode ? cfg.strokeAlpha : '77');
        ctx.lineWidth = nodeCount > 0 ? 2 : 1;
        ctx.setLineDash(nodeCount > 0 ? [] : [5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. Glow — brighter for all rings
        const glow = ctx.createRadialGradient(cx, cy, r - 2, cx, cy, r + 14);
        glow.addColorStop(0, 'rgba(0,0,0,0)');
        glow.addColorStop(0.4, cfg.color + (darkMode ? (nodeCount > 0 ? '35' : '18') : (nodeCount > 0 ? '28' : '12')));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
        ctx.arc(cx, cy, Math.max(0, r - 2), 0, Math.PI * 2, true);
        ctx.fill();

        // 4. Ring label
        const labelX = cx - r - 14;
        const labelOffsetsY = [-24, -10, 8, 22, 36];
        const labelY = cy + labelOffsetsY[i];
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        const labelW = ctx.measureText(cfg.label).width;
        // Pill bg
        ctx.fillStyle = darkMode ? 'rgba(14,13,11,0.85)' : 'rgba(243,239,232,0.88)';
        ctx.strokeStyle = cfg.color + '30';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(labelX - labelW - 6, labelY - 9, labelW + 20, 18, 4);
        ctx.fill();
        ctx.stroke();
        // Text
        ctx.fillStyle = cfg.color;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.label, labelX + 4, labelY);
        // Count badge
        if (nodeCount > 0) {
          ctx.fillStyle = cfg.color;
          ctx.font = 'bold 9px Inter, system-ui, sans-serif';
          ctx.fillText(String(nodeCount), labelX + 16, labelY);
        }
      });

      // ─── RADIAL TICKS ───
      const tickCount = 24;
      const innerTickR = ringRadii[0] * 0.35;
      const outerTickR = ringRadii[4] + 8;
      for (let t = 0; t < tickCount; t++) {
        const angle = (2 * Math.PI * t) / tickCount - Math.PI / 2;
        const isMajor = t % 6 === 0;
        const x1 = cx + innerTickR * Math.cos(angle);
        const y1 = cy + innerTickR * Math.sin(angle);
        const x2 = cx + outerTickR * Math.cos(angle);
        const y2 = cy + outerTickR * Math.sin(angle);
        ctx.strokeStyle = darkMode
          ? `rgba(201,169,110,${isMajor ? 0.1 : 0.03})`
          : `rgba(160,128,64,${isMajor ? 0.08 : 0.02})`;
        ctx.lineWidth = isMajor ? 0.8 : 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Major tick cap
        if (isMajor) {
          ctx.beginPath();
          ctx.arc(x2, y2, 2, 0, Math.PI * 2);
          ctx.fillStyle = darkMode ? 'rgba(201,169,110,0.12)' : 'rgba(160,128,64,0.08)';
          ctx.fill();
        }
      }

      // ─── NODES ───
      nodesRef.current.forEach((node) => {
        if (node.id === centerNode.id) {
          // Center node
          node.x = cx; node.y = cy;
        } else {
          node.x += (node.targetX - node.x) * 0.08;
          node.y += (node.targetY - node.y) * 0.08;
          node.opacity = Math.min(1, node.opacity + 0.02);
        }

        const isCenter = node.id === centerNode.id;
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id && hoveredRef.current !== centerNode.id;
        const isFilterDimmed = highlightNodeIds && !highlightNodeIds.has(node.id) && !isCenter;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.4 : isFilterDimmed ? dimOpacity : node.opacity;

        // Body
        if (isCenter) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          const cg = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, node.radius);
          cg.addColorStop(0, '#7a6a3a');
          cg.addColorStop(1, '#4a3f20');
          ctx.fillStyle = cg;
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Я', node.x, node.y);
        } else {
          drawNodeAvatar(ctx, node.x, node.y, node.radius, node.id, node.name, node.avatar);
        }

        // Border
        const borderColor = isCenter ? '#C9A96E' : node.role ? (COLORS.roleColors[node.role] || COLORS.roleColors.default) : (node.isOnline ? COLORS.nodes.online.border : COLORS.nodes.offline.border);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isCenter ? 2.5 : 2;
        ctx.stroke();

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Online pulse
        if (node.isOnline && !isCenter) {
          const CYCLE = 5000;
          const t = (ts + node.pulseOffset) % CYCLE;
          if (t < 2000) {
            const env = Math.sin((t / 2000) * Math.PI) ** 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 3 + env * 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201,169,110,${env * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // Labels (when zoomed in or hovered)
        const showLabel = !isCenter && (isHovered || cam.cameraRef.current.zoom > 0.85);
        if (showLabel) {
          ctx.font = '9px Inter, system-ui, sans-serif';
          const nw = ctx.measureText(node.name).width;
          const ny = node.y + node.radius + 14;
          ctx.fillStyle = darkMode ? 'rgba(14,13,11,0.9)' : 'rgba(243,239,232,0.92)';
          ctx.beginPath();
          ctx.roundRect(node.x - nw / 2 - 4, ny - 7, nw + 8, 14, 3);
          ctx.fill();
          ctx.fillStyle = darkMode ? '#ccc' : '#555';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.name, node.x, ny);

          // Ring label on hover
          if (isHovered) {
            ctx.fillStyle = RING_CONFIG[node.ringIndex]?.color || '#999';
            ctx.font = '9px Inter, system-ui, sans-serif';
            ctx.fillText(node.ringLabel, node.x, ny + 14);
          }
        }

        ctx.restore();
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [centerNode, nodes, edges, width, height, cx, cy, ringRadii, highlightNodeId, highlightNodeIds, dimOpacity, darkMode, cam, COLORS]);

  // Mouse handlers
  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return cam.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  }, [cam]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (cam.updatePan(e.clientX, e.clientY)) { canvas.style.cursor = 'grabbing'; return; }
    const world = getWorldPos(e);
    if (!world) return;
    let nearest: string | null = null;
    let minDist = Infinity;
    nodesRef.current.forEach((node) => {
      const d = Math.hypot(node.x - world.x, node.y - world.y);
      if (d < node.radius + 8 && d < minDist) { minDist = d; nearest = node.id; }
    });
    if (nearest !== hoveredRef.current) {
      hoveredRef.current = nearest;
      const node = nearest ? nodesRef.current.get(nearest) ?? null : null;
      onNodeHover(node);
      if (node && onHoverScreenPos) {
        const camState = cam.cameraRef.current;
        onHoverScreenPos({
          x: (node.x - width / 2) * camState.zoom + width / 2 + camState.x,
          y: (node.y - height / 2) * camState.zoom + height / 2 + camState.y,
        });
      } else {
        onHoverScreenPos?.(null);
      }
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
    }
  }, [onNodeHover, onHoverScreenPos, cam, getWorldPos, width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    cam.startPan(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grabbing';
  }, [cam]);

  const handleMouseUp = useCallback(() => {
    cam.endPan();
    const c = canvasRef.current;
    if (c) c.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
  }, [cam]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cam.wasDrag(e.clientX, e.clientY)) return;
    const world = getWorldPos(e);
    if (!world) return;
    const found = Array.from(nodesRef.current.values()).find((n) =>
      Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 8
    );
    if (found && found.id !== centerNode.id) onNodeClick(found);
  }, [onNodeClick, cam, getWorldPos, centerNode.id]);

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
