import { useRef, useEffect, useCallback, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { drawNodeAvatar } from '@/hooks/useNodeAvatars';
import type { GraphNode, GraphEdge } from '@/data/graphData';

// Re-export helpers for use in other components
export { findClusters, findBridges, computeCentrality, getClusterName };

interface ClustersTopologyProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  onClusterClick?: (clusterId: number, clusterName: string, members: GraphNode[]) => void;
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
  clusterId: number;
  isBridge: boolean;
  centrality: number; // 0=periphery, 1=core
}

// Cluster colors — distinct, muted, premium
const CLUSTER_COLORS = [
  { fill: 'rgba(201, 169, 110, 0.10)', stroke: 'rgba(201, 169, 110, 0.35)', glow: 'rgba(201, 169, 110, 0.08)', label: '#C9A96E', coreGlow: 'rgba(99,102,241,0.25)' },
  { fill: 'rgba(107, 158, 124, 0.10)', stroke: 'rgba(107, 158, 124, 0.35)', glow: 'rgba(107, 158, 124, 0.08)', label: '#38b2ac', coreGlow: 'rgba(56,178,172,0.25)' },
  { fill: 'rgba(236, 112, 99, 0.10)', stroke: 'rgba(236, 112, 99, 0.35)', glow: 'rgba(236, 112, 99, 0.08)', label: '#ec7063', coreGlow: 'rgba(236,112,99,0.25)' },
  { fill: 'rgba(155, 89, 182, 0.10)', stroke: 'rgba(155, 89, 182, 0.35)', glow: 'rgba(155, 89, 182, 0.08)', label: '#9b59b6', coreGlow: 'rgba(155,89,182,0.25)' },
  { fill: 'rgba(46, 204, 113, 0.08)', stroke: 'rgba(46, 204, 113, 0.30)', glow: 'rgba(46, 204, 113, 0.06)', label: '#2ecc71', coreGlow: 'rgba(46,204,113,0.25)' },
];

const ISOLATED_COLOR = { fill: 'rgba(154, 152, 149, 0.06)', stroke: 'rgba(154, 152, 149, 0.20)', glow: 'rgba(154, 152, 149, 0.04)', label: '#9A9895', coreGlow: 'rgba(148,163,184,0.1)' };
const BRIDGE_GOLD = { stroke: 'rgba(201, 169, 110, 0.7)', glow: 'rgba(201, 169, 110, 0.25)', fill: 'rgba(201, 169, 110, 0.15)' };

// Union-find for clustering by strong edges
function findClusters(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const parent = new Map<string, string>();
  nodes.forEach((n) => parent.set(n.id, n.id));

  const find = (x: string): string => {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  edges.forEach((e) => {
    if (e.weight >= 5) union(e.source, e.target);
  });
  edges.forEach((e) => {
    union(e.source, e.target);
  });

  const clusterMap = new Map<string, number>();
  let nextId = 0;
  const rootToId = new Map<string, number>();

  nodes.forEach((n) => {
    const root = find(n.id);
    if (!rootToId.has(root)) rootToId.set(root, nextId++);
    clusterMap.set(n.id, rootToId.get(root)!);
  });

  return clusterMap;
}

function getClusterName(clusterNodes: GraphNode[]): string {
  const goalCounts = new Map<string, number>();
  const compCounts = new Map<string, number>();
  clusterNodes.forEach((n) => {
    n.goals.forEach((g) => goalCounts.set(g, (goalCounts.get(g) || 0) + 1));
    n.competencies.forEach((c) => compCounts.set(c, (compCounts.get(c) || 0) + 1));
  });

  let topGoal = '', topGoalCount = 0;
  goalCounts.forEach((count, goal) => {
    if (count > topGoalCount) { topGoalCount = count; topGoal = goal; }
  });
  if (topGoalCount >= 2) return topGoal;

  let topComp = '', topCompCount = 0;
  compCounts.forEach((count, comp) => {
    if (count > topCompCount) { topCompCount = count; topComp = comp; }
  });
  if (topCompCount >= 2) return topComp;

  if (clusterNodes.length >= 3) return 'Смешанная группа';
  return clusterNodes.length === 2 ? 'Пара' : 'Нужна первая связь';
}

// Compute centrality = how close node is to cluster center (by edge weight)
function computeCentrality(nodeId: string, edges: GraphEdge[]): number {
  const nodeEdges = edges.filter((e) => e.source === nodeId || e.target === nodeId);
  if (nodeEdges.length === 0) return 0;
  const totalWeight = nodeEdges.reduce((s, e) => s + e.weight, 0);
  const maxPossible = nodeEdges.length * 10;
  return Math.min(1, totalWeight / maxPossible + nodeEdges.length * 0.08);
}

// Detect bridge nodes (have edges to other clusters)
function findBridges(edges: GraphEdge[], clusterMap: Map<string, number>): Set<string> {
  const bridges = new Set<string>();
  edges.forEach((e) => {
    const c1 = clusterMap.get(e.source);
    const c2 = clusterMap.get(e.target);
    if (c1 !== undefined && c2 !== undefined && c1 !== c2) {
      bridges.add(e.source);
      bridges.add(e.target);
    }
  });
  return bridges;
}

export function ClustersTopology({
  nodes, edges, onNodeHover, onNodeClick, onClusterClick, width, height,
  darkMode = true, camera: externalCamera,
}: ClustersTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalCam = useCamera(width, height, 0.55);
  const cam = externalCamera ?? internalCam;
  const simRef = useRef<Map<string, SimNode>>(new Map());
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const clusterMapRef = useRef<Map<string, number>>(new Map());
  const bridgeRef = useRef<Set<string>>(new Set());
  const coreNodesRef = useRef<Set<string>>(new Set());
  const clusterAreasRef = useRef<Map<number, { cx: number; cy: number; rx: number; ry: number }>>(new Map());
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

  // Initialize simulation
  useEffect(() => {
    clusterMapRef.current = findClusters(nodes, edges);
    bridgeRef.current = findBridges(edges, clusterMapRef.current);

    const cx = width / 2;
    const cy = height * 0.42;

    const clusters = new Map<number, GraphNode[]>();
    nodes.forEach((n) => {
      const cid = clusterMapRef.current.get(n.id) ?? -1;
      if (!clusters.has(cid)) clusters.set(cid, []);
      clusters.get(cid)!.push(n);
    });

    // Compute core nodes: top-3 by centrality per cluster
    coreNodesRef.current = new Set<string>();
    clusters.forEach((members, cid) => {
      if (cid === -1) return;
      const sorted = [...members].sort((a, b) => {
        const ca = computeCentrality(a.id, edges);
        const cb = computeCentrality(b.id, edges);
        return cb - ca;
      });
      sorted.slice(0, 3).forEach((n) => coreNodesRef.current.add(n.id));
    });

    const clusterIds = Array.from(clusters.keys());
    const clusterPositions = new Map<number, { x: number; y: number }>();
    clusterIds.forEach((cid, i) => {
      const angle = (2 * Math.PI * i) / Math.max(clusterIds.length, 1) - Math.PI / 2;
      const dist = Math.min(width, height) * 0.24;
      clusterPositions.set(cid, { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) });
    });

    nodes.forEach((node, i) => {
      const prev = simRef.current.get(node.id);
      const cid = clusterMapRef.current.get(node.id) ?? -1;
      const cpos = clusterPositions.get(cid);
      const isBridge = bridgeRef.current.has(node.id);
      const centrality = computeCentrality(node.id, edges);

      const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) + Math.random() * 0.5;
      const offset = 30 + Math.random() * 60;
      const initX = cpos ? cpos.x + offset * Math.cos(angle) : cx + (Math.random() - 0.5) * 200;
      const initY = cpos ? cpos.y + offset * Math.sin(angle) : cy + (Math.random() - 0.5) * 200;

      simRef.current.set(node.id, {
        ...node,
        x: prev?.x ?? initX,
        y: prev?.y ?? initY,
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        radius: 18 + centrality * 10 + (isBridge ? 3 : 0),
        clusterId: cid,
        isBridge,
        centrality,
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

    const animate = () => {
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

      const simNodes = Array.from(simRef.current.values());

      // Physics
      const repulsionK = 2500;
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
        const idealLen = 80 + (10 - edge.weight) * 8;
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

      // Group by cluster
      const clusters = new Map<number, SimNode[]>();
      simNodes.forEach((n) => {
        if (!clusters.has(n.clusterId)) clusters.set(n.clusterId, []);
        clusters.get(n.clusterId)!.push(n);
      });

      // Draw cluster backgrounds
      clusters.forEach((members, cid) => {
        if (members.length === 0) return;
        const color = cid === -1 ? ISOLATED_COLOR : CLUSTER_COLORS[cid % CLUSTER_COLORS.length];

        let cx = 0, cy = 0;
        members.forEach((m) => { cx += m.x; cy += m.y; });
        cx /= members.length;
        cy /= members.length;

        let cr = 0;
        members.forEach((m) => {
          cr = Math.max(cr, Math.hypot(m.x - cx, m.y - cy) + m.radius + 28);
        });
        cr = Math.max(cr, 60);

        // Save cluster area for click detection
        clusterAreasRef.current.set(cid, { cx, cy, rx: cr, ry: cr * 0.88 });

        // Cluster glow
        const glow = ctx.createRadialGradient(cx, cy, cr * 0.3, cx, cy, cr + 35);
        glow.addColorStop(0, color.glow);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 35, 0, Math.PI * 2);
        ctx.fill();

        // Cluster fill
        const isClusterHovered = hoveredCluster === cid;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cr, cr * 0.88, 0, 0, Math.PI * 2);
        ctx.fillStyle = isClusterHovered
          ? color.fill.replace(/[\d.]+\)$/, '0.18)')
          : color.fill;
        ctx.fill();
        ctx.strokeStyle = isClusterHovered
          ? color.stroke.replace(/[\d.]+\)$/, '0.6)')
          : color.stroke;
        ctx.lineWidth = isClusterHovered ? 2 : 1;
        ctx.stroke();

        // Hover indicator
        if (isClusterHovered) {
          ctx.save();
          ctx.shadowColor = color.label;
          ctx.shadowBlur = 12;
          ctx.strokeStyle = color.label.replace(')', ', 0.3)').replace('rgb', 'rgba');
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, cr + 4, cr * 0.88 + 4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Cluster label
        const clusterNodes = members.map((m) => nodes.find((n) => n.id === m.id)!).filter(Boolean);
        const name = cid === -1 ? 'Нужна первая связь' : getClusterName(clusterNodes);
        const count = members.length;

        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = color.label;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${name} · ${count}`, cx, cy - cr + 18);
      });

      // Draw edges
      edges.forEach((edge) => {
        const src = simRef.current.get(edge.source);
        const tgt = simRef.current.get(edge.target);
        if (!src || !tgt) return;

        const isBridge = src.clusterId !== tgt.clusterId;

        if (isBridge) {
          // Bridge edges: gold, dashed, strong glow
          ctx.save();
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.45)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 5]);
          ctx.shadowColor = 'rgba(201, 169, 110, 0.4)';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();
          ctx.restore();

          // Bridge label
          const mx = (src.x + tgt.x) / 2;
          const my = (src.y + tgt.y) / 2;
          ctx.save();
          const label = 'мост';
          const lw = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(10, 14, 30, 0.9)';
          ctx.beginPath();
          ctx.roundRect(mx - lw / 2 - 5, my - 9, lw + 10, 16, 5);
          ctx.fill();
          ctx.strokeStyle = 'rgba(201, 169, 110, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = 'bold 10px Inter, system-ui, sans-serif';
          ctx.fillStyle = 'rgba(201, 169, 110, 0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, mx, my + 0.5);
          ctx.restore();
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + (src.centrality + tgt.centrality) * 0.06})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      simRef.current.forEach((node) => {
        const isHovered = hoveredRef.current === node.id;
        const isDimmed = hoveredRef.current && hoveredRef.current !== node.id;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.35 : 1;

        const isIsolated = node.clusterId === -1;
        const color = isIsolated ? ISOLATED_COLOR : CLUSTER_COLORS[node.clusterId % CLUSTER_COLORS.length];

        // Core glow — stronger for core nodes, weaker for periphery
        const glowR = node.radius + 10 + node.centrality * 12;
        const glowGrad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.4, node.x, node.y, glowR);
        const glowAlpha = 0.08 + node.centrality * 0.18;
        if (node.isBridge) {
          glowGrad.addColorStop(0, BRIDGE_GOLD.glow);
        } else {
          glowGrad.addColorStop(0, color.coreGlow.replace(/[\d.]+\)$/, `${glowAlpha})`));
        }
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Avatar — circular gradient placeholder (photo-ready)
        drawNodeAvatar(ctx, node.x, node.y, node.radius * 0.92, node.id, node.name, node.avatar);

        // Bridge tint overlay
        if (node.isBridge) {
          const bridgeGrad = ctx.createRadialGradient(node.x, node.y, node.radius * 0.3, node.x, node.y, node.radius);
          bridgeGrad.addColorStop(0, 'rgba(201, 169, 110, 0.12)');
          bridgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bridgeGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Border — bridge nodes get gold border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.isBridge) {
          ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.6)' : BRIDGE_GOLD.stroke;
          ctx.lineWidth = isHovered ? 2.5 : 2;
          ctx.shadowColor = BRIDGE_GOLD.glow;
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.5)' : color.stroke;
          ctx.lineWidth = isHovered ? 2 : 1.5;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Isolated indicator — red ring
        if (isIsolated) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Hover ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 14, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Initials
        ctx.font = `bold ${11 + node.centrality * 2}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = isHovered ? '#ffffff' : node.isBridge ? 'rgba(201, 169, 110, 0.9)' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Initials removed — avatar handles the display

        // Bridge badge (star icon next to node)
        if (node.isBridge && !isIsolated) {
          const badgeX = node.x + node.radius * 0.7;
          const badgeY = node.y - node.radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 14, 30, 0.9)';
          ctx.fill();
          ctx.strokeStyle = BRIDGE_GOLD.stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = 'bold 8px Inter, system-ui, sans-serif';
          ctx.fillStyle = 'rgba(201, 169, 110, 0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', badgeX, badgeY + 0.5);
        }

        // Name pill
        const nameText = node.name;
        // Name label hidden at zoom <= initialZoom (0.55)
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
        }

        // Names and position labels hidden at zoom <= initialZoom (0.55)
        if (cam.cameraRef.current.zoom > 0.55) {
          // Position label: only for bridges, periphery, and top-core nodes
          let posLabel = '';
          if (node.isBridge && !isIsolated) posLabel = 'мост';
          else if (coreNodesRef.current.has(node.id) && !isIsolated && node.centrality > 0.5) posLabel = 'ядро';
          else if (node.centrality < 0.25 && !isIsolated && node.clusterId !== -1) posLabel = 'периферия';

          if (posLabel) {
            ctx.font = '9px Inter, system-ui, sans-serif';
            ctx.fillStyle = node.isBridge ? 'rgba(201, 169, 110, 0.55)' : 'rgba(154, 152, 149, 0.4)';
            ctx.fillText(posLabel, node.x, node.y + node.radius + 32);
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

    // Check node hover first
    let nearest: string | null = null;
    let minDist = Infinity;
    simRef.current.forEach((node) => {
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist < node.radius + 10 && dist < minDist) { minDist = dist; nearest = node.id; }
    });

    // If no node, check cluster hover
    let hoveredCid: number | null = null;
    if (!nearest) {
      clusterAreasRef.current.forEach((area, cid) => {
        const dx = (world.x - area.cx) / area.rx;
        const dy = (world.y - area.cy) / area.ry;
        if (dx * dx + dy * dy <= 1.1) hoveredCid = cid;
      });
    }
    setHoveredCluster(hoveredCid);

    if (nearest !== hoveredRef.current) {
      hoveredRef.current = nearest;
      onNodeHover(nearest ? simRef.current.get(nearest) ?? null : null);
    }
    canvas.style.cursor = nearest || hoveredCid !== null ? 'pointer' : 'grab';
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

    // Node click takes priority
    const found = Array.from(simRef.current.values()).find((n) => {
      return Math.hypot(n.x - world.x, n.y - world.y) < n.radius + 10;
    });
    if (found) {
      onNodeClick(found);
      return;
    }

    // Cluster click
    if (onClusterClick) {
      clusterAreasRef.current.forEach((area, cid) => {
        const dx = (world.x - area.cx) / area.rx;
        const dy = (world.y - area.cy) / area.ry;
        if (dx * dx + dy * dy <= 1.1) {
          const clusterNodes = nodes.filter((n) => (clusterMapRef.current.get(n.id) ?? -1) === cid);
          const name = getClusterName(clusterNodes);
          onClusterClick(cid, name, clusterNodes);
        }
      });
    }
  }, [onNodeClick, onClusterClick, nodes, cam]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: darkMode ? '#0E0D0B' : '#EDE9E0' }}>
        <div className="text-center px-8 max-w-sm">
          <p className="text-subtitle text-stone-400 mb-2">Кластеры пока не сформировались</p>
          <p className="text-caption text-stone-600 leading-relaxed">
            Они появятся, когда участники начнут проходить треки, помогать друг другу,
            благодарить и участвовать в общих ритуалах.
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
    </div>
  );
}
