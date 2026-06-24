import { useRef, useEffect, useCallback } from 'react';
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
  ringIndex: number;
  ringLabel: string;
  distanceInRing: number; // 0=inner, 1=outer within ring
}

function getColors(dark: boolean) {
  return {
    bgGradient: dark ? ['#1a1814', '#141416', '#0f0f12'] : ['#FDFBF7', '#FAFAF8', '#F5F4F0'],
    center: { fill: dark ? '#5a4a2a' : '#8a7a4a', glow: dark ? 'rgba(201, 169, 110, 0.35)' : 'rgba(201, 169, 110, 0.25)', pulse: dark ? 'rgba(212, 184, 122, 0.15)' : 'rgba(201, 169, 110, 0.12)', text: '#ffffff', border: '#C9A96E' },
    nodes: {
      online: { fill: dark ? '#3a3020' : '#f5efe3', glow: dark ? 'rgba(201, 169, 110, 0.5)' : 'rgba(201, 169, 110, 0.4)', border: '#C9A96E' },
      offline: { fill: dark ? '#1c1c1f' : '#f0eeea', glow: dark ? 'rgba(120, 113, 108, 0.15)' : 'rgba(120, 113, 108, 0.1)', border: dark ? '#4a4a4e' : '#c8c5bf' },
      stuck: { fill: '#3c2a1e', glow: 'rgba(237, 137, 54, 0.25)', border: '#ed8936' },
      burnout: { fill: '#3c1e1e', glow: 'rgba(245, 101, 101, 0.2)', border: '#f56565' },
    },
    edges: {
      help: '#7a8faf', review: '#6B9E7C', flow: '#ed8936',
      mentorship: '#B89cc0', gratitude: '#ecc94b', mutual: '#38b2ac',
      default: dark ? '#2a2a2e' : '#d8d5cf', decaying: dark ? '#1a1a1e' : '#e8e5df',
    },
    rings: [
      { color: 'rgba(201, 169, 110, 0.22)', stroke: 'rgba(201, 169, 110, 0.90)', label: 'Опоры', desc: 'Устойчивые связи: можно попросить совет.' },
      { color: 'rgba(184, 156, 192, 0.15)', stroke: 'rgba(184, 156, 192, 0.85)', label: 'Близкие', desc: 'Тёплые связи — написать, продолжить контакт.' },
      { color: 'rgba(107, 158, 124, 0.12)', stroke: 'rgba(107, 158, 124, 0.80)', label: 'Коллеги', desc: 'Общий контекст — обменяться опытом.' },
      { color: 'rgba(154, 152, 149, 0.08)', stroke: 'rgba(154, 152, 149, 0.70)', label: 'Знакомые', desc: 'Слабая связь — мягко оживить.' },
      { color: 'rgba(106, 104, 101, 0.05)', stroke: 'rgba(106, 104, 101, 0.45)', label: 'Потенциальные', desc: 'Связи ещё нет — познакомиться.' },
    ],
    roleColors: {
      'Помощник по практике': '#C9A96E', 'Помощник на старт': '#B89cc0',
      'Хранитель знаний': '#d69e2e', 'Куратор': '#ed64a6',
      'Связующий': '#6B9E7C', default: dark ? '#6A6865' : '#999999',
    } as Record<string, string>,
  };
}

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

function getRingIndex(node: GraphNode, edge?: GraphEdge): number {
  if (!edge) return 4; // No connection = Потенциальные
  if (node.role === 'Помощник по практике' || node.role === 'Помощник на старт' || node.role === 'Куратор') return 0;
  const weight = edge.weight;
  if (weight >= 7) return 0; // Опоры
  if (weight >= 5) return 1; // Близкие
  if (weight >= 3) return 2; // Коллеги
  if (weight >= 1) return 3; // Знакомые (вес 1-2)
  return 4; // Потенциальные (вес 0)
}

function getNodeRadius(contributionLevel: number): number {
  if (contributionLevel >= 7) return 28;
  if (contributionLevel >= 4) return 24;
  if (contributionLevel >= 2) return 21;
  return 17;
}

export function CirclesTopology({
  centerNode, nodes, edges, onNodeHover, onNodeClick, onRingClick, onHoverScreenPos, highlightNodeId, highlightNodeIds, dimOpacity = 0.2, width, height,
darkMode = true,
}: CirclesTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, RenderNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const timeRef = useRef(0);
  const activeRingsRef = useRef<boolean[]>([true, true, true, true, true]);
  const adaptiveRingRadiiRef = useRef<number[]>([0, 0, 0, 0, 0]);

  const COLORS = getColors(darkMode);
  const cam = useCamera(width, height, 0.82);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.46;
  // Wider spacing between rings so each zone is clearly distinct
  const ringRadii = [maxR * 0.16, maxR * 0.34, maxR * 0.54, maxR * 0.76, maxR * 0.95];

  useEffect(() => {
    const centerRn: RenderNode = {
      ...centerNode, x: cx, y: cy, targetX: cx, targetY: cy,
      radius: 36, opacity: 0, pulsePhase: 0, pulseOffset: 0, ringIndex: -1, ringLabel: '', distanceInRing: 0,
    };
    nodesRef.current.set(centerNode.id, centerRn);

    const ringPositions: string[][] = [[], [], [], [], []];
    nodes.forEach((node) => {
      const edge = edges.find(
        (e) => (e.source === centerNode.id && e.target === node.id) ||
               (e.target === centerNode.id && e.source === node.id)
      );
      let ri = getRingIndex(node, edge);
      // Ensure p7 (Dmitry N.) is always in ring 3 (Acquaintances)
      if (node.id === 'p7') ri = 3;
      ringPositions[ri].push(node.id);
    });

    // Update active rings (hide empty ones)
    activeRingsRef.current = ringPositions.map((ids) => ids.length > 0);

    ringPositions.forEach((nodeIds, ri) => {
      if (nodeIds.length === 0) return; // Skip empty rings
      const baseR = ringRadii[ri];
      // Adaptive radius: expand ring if too many nodes to fit without overlap
      const maxNodeR = Math.max(...nodeIds.map((nid) => {
        const n = nodes.find((nn) => nn.id === nid);
        return n ? getNodeRadius(n.contributionLevel) : 20;
      }));
      const spacing = 1.45; // 45% gap between node edges
      const minR = (nodeIds.length * maxNodeR * spacing) / Math.PI;
      const r = Math.max(baseR, minR);
      adaptiveRingRadiiRef.current[ri] = r; // Store for rendering

      nodeIds.forEach((nid, i) => {
        const node = nodes.find((n) => n.id === nid)!;
        const angle = (2 * Math.PI * i) / Math.max(nodeIds.length, 1) - Math.PI / 2;
        const existing = nodesRef.current.get(nid);
        const ringChanged = existing ? existing.ringIndex !== ri : false;

        nodesRef.current.set(nid, {
          ...node,
          x: ringChanged ? cx : (existing?.x ?? cx),
          y: ringChanged ? cy : (existing?.y ?? cy),
          targetX: cx + r * Math.cos(angle),
          targetY: cy + r * Math.sin(angle),
          radius: getNodeRadius(node.contributionLevel),
          opacity: existing?.opacity ?? 0,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseOffset: Math.random() * 5000,
          ringIndex: ri,
          ringLabel: COLORS.rings[ri].label,
          distanceInRing: 0,
        });
      });
    });
  }, [centerNode, nodes, edges, width, height, cx, cy, maxR, ringRadii]);

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
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, COLORS.bgGradient[0]);
      bgGrad.addColorStop(0.5, COLORS.bgGradient[1]);
      bgGrad.addColorStop(1, COLORS.bgGradient[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      cam.applyTransform(ctx);

      // Ambient glow behind center
      const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
      ambientGlow.addColorStop(0, 'rgba(201, 169, 110, 0.06)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(cx - 180, cy - 180, 360, 360);

      // Draw RING CIRCLES (adaptive radius, skip empty rings)
      adaptiveRingRadiiRef.current.forEach((r, i) => {
        if (!activeRingsRef.current[i]) return; // Skip empty rings
        const ringPulse = Math.sin(ts * 0.0008 + i * 1.2) * 2;
        // Ring glow area
        const glowInner = Math.max(0, r - 18);
        const ringGlow = ctx.createRadialGradient(cx, cy, glowInner, cx, cy, r + 18);
        ringGlow.addColorStop(0, 'rgba(0,0,0,0)');
        ringGlow.addColorStop(0.5, COLORS.rings[i].color);
        ringGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ringGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 20, 0, Math.PI * 2);
        ctx.fill();

        // Ring line (dashed)
        ctx.strokeStyle = COLORS.rings[i].stroke;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, r + ringPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring label — all on left side, staggered vertically to avoid overlap
        const labelX = cx - r - 14;
        const labelOffsetsY = [-22, -8, 6, 20, 34];
        const labelY = cy + labelOffsetsY[i];
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const labelText = COLORS.rings[i].label;
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        const labelWidth = ctx.measureText(labelText).width;
        // Label background for readability
        ctx.fillStyle = 'rgba(20, 20, 22, 0.92)';
        ctx.beginPath();
        ctx.roundRect(labelX - labelWidth - 8, labelY - 10, labelWidth + 16, 20, 4);
        ctx.fill();
        // Label text
        ctx.fillStyle = COLORS.rings[i].stroke;
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillText(labelText, labelX, labelY);
        // Small dot indicator
        ctx.beginPath();
        ctx.arc(labelX + 8, labelY, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.rings[i].stroke;
        ctx.fill();

      });

      // Draw EDGES — only on hover/click (Circles = balance view, not connection map)
      const hoveredNodeId = hoveredRef.current;
      edges.forEach((edge) => {
        const src = nodesRef.current.get(edge.source);
        const tgt = nodesRef.current.get(edge.target);
        if (!src || !tgt) return;

        const isHovered = hoveredRef.current === edge.source || hoveredRef.current === edge.target;
        const isHighlighted = highlightNodeId === edge.source || highlightNodeId === edge.target;
        const isCenterEdge = edge.source === centerNode.id || edge.target === centerNode.id;

        // Skip if no hover/click — lines appear on demand in Circles
        if (!hoveredNodeId && !highlightNodeId) return;

        ctx.save();
        const edgeOpacity = isHovered || isHighlighted ? 0.9 : isCenterEdge ? 0.55 : 0.18;
        const edgeColor = COLORS.edges[edge.type as keyof typeof COLORS.edges] || COLORS.edges.default;
        const lineWidth = isHovered ? Math.max(1.2, edge.weight * 0.4) : Math.max(0.5, edge.weight * 0.22);

        // Line style: dashed = potential connection (weight <= 2)
        // Brightness = activity freshness (recent = bright, stale = dim)
        const recent = isRecent(edge.lastInteraction, 7);
        const stale = isStale(edge.lastInteraction, 30);
        const isPotential = edge.weight <= 2;

        if (isPotential) {
          ctx.setLineDash([4, 6]);
          ctx.globalAlpha = edgeOpacity * (stale ? 0.3 : 0.5);
        } else {
          ctx.setLineDash([]);
          ctx.globalAlpha = edgeOpacity * (recent ? 1.0 : stale ? 0.3 : 0.7);
        }

        ctx.strokeStyle = edgeColor + Math.floor(edgeOpacity * 140).toString(16).padStart(2, '0');
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();

        if (isHovered || isCenterEdge) {
          ctx.globalAlpha = edgeOpacity * 0.12;
          ctx.strokeStyle = edgeColor;
          ctx.lineWidth = lineWidth * 4;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();
        }

        // Arrowhead
        if (edge.type !== 'mutual' && edge.type !== 'flow') {
          const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
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
      nodesRef.current.forEach((node) => {
        node.x += (node.targetX - node.x) * 0.07;
        node.y += (node.targetY - node.y) * 0.07;
        node.opacity = Math.min(1, node.opacity + 0.015);

        const isCenter = node.id === centerNode.id;
        const isHovered = hoveredRef.current === node.id;
        const isHoverDimmed = hoveredRef.current && hoveredRef.current !== node.id && hoveredRef.current !== centerNode.id;
        const isFilterDimmed = highlightNodeIds && !highlightNodeIds.has(node.id) && !isCenter;

        ctx.save();
        ctx.globalAlpha = isHoverDimmed ? 0.55 : isFilterDimmed ? dimOpacity : node.opacity;

        let nodeScheme = COLORS.nodes.offline;
        if (isCenter) nodeScheme = COLORS.center;
        else if (node.status === 'stuck') nodeScheme = COLORS.nodes.stuck;
        else if (node.status === 'burnout_risk') nodeScheme = COLORS.nodes.burnout;
        else if (node.isOnline) nodeScheme = COLORS.nodes.online;

        // All nodes render as full circles — no dot-only mode for periphery

        // Online indicator drawn after border (see below)

        // Center multi-ring
        if (isCenter) {
          const op = Math.sin(ts * 0.0012) * 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 12 + op, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6 + Math.sin(ts * 0.0018 + 1) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.22)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node body
        if (isCenter) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          const cg = ctx.createRadialGradient(node.x - 6, node.y - 6, 2, node.x, node.y, node.radius);
          cg.addColorStop(0, '#7a6a3a');
          cg.addColorStop(1, '#4a3f20');
          ctx.fillStyle = cg;
          ctx.fill();
        } else {
          // Avatar — circular gradient placeholder (photo-ready)
          drawNodeAvatar(ctx, node.x, node.y, node.radius, node.id, node.name, node.avatar);
        }

        // Border
        const borderColor = isCenter ? '#C9A96E' : node.role ? COLORS.roleColors[node.role] || COLORS.roleColors.default : nodeScheme.border;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isCenter ? 2.5 : 1.8;
        ctx.stroke();

        // RECENT ACTIVITY — role-colored glow outside circle (Level 1)
        if (!isCenter && node.role) {
          const nodeEdges = edges.filter(
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
          ctx.font = 'bold 15px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Я', node.x, node.y);
          // Label below center node intentionally hidden
        }

        // Help ready badge — gold to match theme
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
          ctx.strokeStyle = '#141416';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // NAME + ROLE LABELS — zoom-dependent: show only when zoomed in or hovered
        // Center node name ("Анна К.") intentionally hidden — only "Я" shown inside circle
        const showLabels = !isCenter && (isHovered || cam.cameraRef.current.zoom > 0.82);
        if (showLabels) {
          ctx.font = '10px Inter, system-ui, sans-serif';
          const nameWidth = ctx.measureText(node.name).width;
          const namePadding = 5;
          const nameY = node.y + node.radius + 14;

          // Draw pill background
          ctx.beginPath();
          ctx.roundRect(node.x - nameWidth / 2 - namePadding, nameY - 9, nameWidth + namePadding * 2, 15, 4);
          ctx.fillStyle = isHovered ? 'rgba(20, 20, 22, 0.95)' : 'rgba(20, 20, 22, 0.88)';
          ctx.fill();

          // Draw name text
          ctx.fillStyle = isHovered ? '#ffffff' : '#9A9895';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.name, node.x, nameY);

          // ROLE LABEL — smaller, with colored pill background
          if (node.role) {
            const roleFont = '8px Inter, system-ui, sans-serif';
            ctx.font = roleFont;
            const roleWidth = ctx.measureText(node.role).width;
            const rolePadding = 3;
            const roleY = node.y + node.radius + 32;

            // Draw pill background
            ctx.beginPath();
            ctx.roundRect(node.x - roleWidth / 2 - rolePadding, roleY - 6, roleWidth + rolePadding * 2, 12, 3);
            const roleColor = COLORS.roleColors[node.role] || COLORS.roleColors.default;
            ctx.fillStyle = roleColor + '20';
            ctx.fill();
            ctx.strokeStyle = roleColor + '35';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Draw role text
            ctx.fillStyle = roleColor + 'cc';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.role, node.x, roleY);
          }
        }

        // Ring badge (show which ring on hover)
        if (isHovered && !isCenter) {
          ctx.font = '11px Inter, system-ui, sans-serif';
          ctx.fillStyle = COLORS.rings[node.ringIndex].stroke;
          ctx.fillText(node.ringLabel, node.x, node.y + node.radius + 44);
        }
      });

      ctx.restore(); // end camera transform

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [centerNode, edges, width, height, cx, cy, maxR, ringRadii, highlightNodeId]);

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
    let nearestScreenPos = { x: 0, y: 0 };
    nodesRef.current.forEach((node) => {
      const hitR = node.radius + 10;
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist < hitR && dist < minDist) {
        minDist = dist;
        nearest = node.id;
        // Compute screen position for tooltip
        const cx2 = width / 2;
        const cy2 = height / 2;
        const cam2 = cam.cameraRef.current;
        nearestScreenPos = {
          x: (node.x - cx2) * cam2.zoom + cx2 + cam2.x,
          y: (node.y - cy2) * cam2.zoom + cy2 + cam2.y,
        };
      }
    });
    if (nearest !== hoveredRef.current) {
      hoveredRef.current = nearest;
      const node = nearest ? nodesRef.current.get(nearest) ?? null : null;
      onNodeHover(node);
      onHoverScreenPos?.(nearest ? nearestScreenPos : null);
      canvas.style.cursor = nearest ? 'pointer' : 'grab';
    }
  }, [onNodeHover, onHoverScreenPos, cam, width, height]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cam.startPan(e.clientX, e.clientY);
    canvas.style.cursor = 'grabbing';
  }, [cam]);

  const handleMouseUp = useCallback(() => {
    cam.endPan();
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
  }, [cam]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cam.wasDrag(e.clientX, e.clientY)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = cam.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const found = Array.from(nodesRef.current.values()).find((n) => {
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
    });
    if (found && found.id !== 'me') {
      onNodeClick(found);
      return;
    }
    // Ring hit-test: check if click landed on a ring circle (but not on a node)
    if (onRingClick) {
      const cx = width / 2;
      const cy = height / 2;
      const distFromCenter = Math.hypot(world.x - cx, world.y - cy);
      for (let ri = 0; ri < adaptiveRingRadiiRef.current.length; ri++) {
        const r = adaptiveRingRadiiRef.current[ri];
        if (!activeRingsRef.current[ri]) continue;
        // Hit zone: ring line ±12px
        if (Math.abs(distFromCenter - r) < 14) {
          onRingClick(ri);
          return;
        }
      }
    }
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
