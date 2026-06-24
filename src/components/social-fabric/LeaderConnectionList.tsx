import { useState } from 'react';
import { ChevronRight, AlertTriangle, Star, Zap, Heart, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface LeaderConnectionListProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  signals: { type: string; nodeId: string; message: string; action: string }[];
  currentUserId?: string;
  selectedNodeId?: string | null;
  onNodeClick: (node: GraphNode) => void;
  onMessage: (node: GraphNode) => void;
  onRequestHelp?: (node: GraphNode) => void;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  active:       { bg: 'rgba(107,158,124,0.08)', text: '#6B9E7C', border: 'rgba(107,158,124,0.2)', icon: <TrendingUp className="w-2.5 h-2.5" /> },
  stuck:        { bg: 'rgba(212,175,55,0.08)',  text: '#d4a72c', border: 'rgba(212,175,55,0.2)',  icon: <Minus className="w-2.5 h-2.5" /> },
  burnout_risk: { bg: 'rgba(236,72,153,0.08)',  text: '#ec4899', border: 'rgba(236,72,153,0.2)',  icon: <TrendingDown className="w-2.5 h-2.5" /> },
  inactive:     { bg: 'rgba(120,113,108,0.08)',  text: '#9A9895', border: 'rgba(120,113,108,0.2)',  icon: <Activity className="w-2.5 h-2.5" /> },
};

const STATUS_LABELS: Record<string, string> = {
  active: 'В движении',
  stuck: 'Нужен импульс',
  burnout_risk: 'Много помогает',
  inactive: 'Нужна связь',
};

const LIST_FILTERS = [
  { key: '', label: 'Все' },
  { key: 'attention', label: 'Требуют внимания' },
  { key: 'connectors', label: 'Связующие' },
  { key: 'helpers', label: 'Готовы помогать' },
  { key: 'stable', label: 'Устойчивые' },
] as const;

function getSignalIcon(type: string) {
  switch (type) {
    case 'isolation': return <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />;
    case 'overload': return <Zap className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />;
    case 'connector': return <Star className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />;
    case 'potential': return <Heart className="w-3.5 h-3.5" style={{ color: '#ec4899' }} />;
    default: return null;
  }
}

function getItemReason(node: GraphNode, ne: GraphEdge[], signal?: { type: string }): string {
  if (signal?.type === 'isolation') return ne.length === 0 ? 'Нет устойчивых связей · нужна первая связь' : 'Связи слабые · нужна опора';
  if (signal?.type === 'overload') return `Много помогает · ${ne.length} связей помощи · риск перегруза`;
  if (signal?.type === 'connector') return `Соединяет ${ne.length > 2 ? 'несколько' : 'две'} группы · важный носитель ткани`;
  if (signal?.type === 'potential') return 'Подтверждённый вклад · помогал в потоке · можно предложить роль';
  if (node.isHelpReady && ne.length >= 3) return `Готов помочь · ${ne.length} связей · можно пригласить в круг`;
  return `Стабильное движение · ${ne.length} связей · может стать опорой`;
}

function getItemAction(node: GraphNode, ne: GraphEdge[], signal?: { type: string; action: string }): { label: string; bg: string; text: string; border: string } {
  if (signal?.type === 'isolation') return { label: signal.action, bg: 'rgba(212,175,55,0.08)', text: '#d4a72c', border: 'rgba(212,175,55,0.2)' };
  if (signal?.type === 'overload') return { label: 'Разгрузить', bg: 'rgba(239,68,68,0.08)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' };
  if (signal?.type === 'connector') return { label: 'Предложить роль', bg: 'rgba(107,158,124,0.08)', text: '#6B9E7C', border: 'rgba(107,158,124,0.2)' };
  if (signal?.type === 'potential') return { label: 'Предложить роль', bg: 'rgba(168,85,247,0.08)', text: '#a855f7', border: 'rgba(168,85,247,0.2)' };
  if (node.isHelpReady && ne.length >= 3) return { label: 'Пригласить в круг', bg: 'rgba(107,158,124,0.08)', text: '#6B9E7C', border: 'rgba(107,158,124,0.2)' };
  return { label: 'Отметить вклад', bg: 'rgba(201,169,110,0.08)', text: '#C9A96E', border: 'rgba(201,169,110,0.2)' };
}

export function LeaderConnectionList({
  nodes, edges, signals, selectedNodeId, onNodeClick, onMessage,
}: LeaderConnectionListProps) {
  const [activeFilter, setActiveFilter] = useState<string>('');

  const attention: { node: GraphNode; edges: GraphEdge[]; signal?: typeof signals[0] }[] = [];
  const connectors: { node: GraphNode; edges: GraphEdge[] }[] = [];
  const helpers: { node: GraphNode; edges: GraphEdge[] }[] = [];
  const stable: { node: GraphNode; edges: GraphEdge[] }[] = [];

  nodes.forEach((node) => {
    const ne = edges.filter((e) => e.source === node.id || e.target === node.id);
    const signal = signals.find((s) => s.nodeId === node.id);
    if (signal?.type === 'isolation' || signal?.type === 'overload') attention.push({ node, edges: ne, signal });
    else if (signal?.type === 'connector') connectors.push({ node, edges: ne });
    else if (node.isHelpReady && ne.length >= 3) helpers.push({ node, edges: ne });
    else stable.push({ node, edges: ne });
  });

  const filterActive = (key: string) => activeFilter === '' || activeFilter === key;

  const renderCard = ({ node, edges: ne, signal }: { node: GraphNode; edges: GraphEdge[]; signal?: typeof signals[0] }) => {
    const reason = getItemReason(node, ne, signal);
    const action = getItemAction(node, ne, signal);
    const statusLabel = STATUS_LABELS[node.status] || 'В движении';
    const sb = STATUS_BADGES[node.status] || STATUS_BADGES.active;
    const isSelected = selectedNodeId === node.id;

    return (
      <div
        key={node.id}
        onClick={() => onNodeClick(node)}
        className="group flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer transition-all duration-200"
        style={{
          border: isSelected ? '1px solid var(--gold)' : '1px solid transparent',
          backgroundColor: isSelected ? 'var(--hover-bg)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            backgroundColor: node.isOnline ? 'var(--hover-bg)' : 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          {node.name.split(' ').map((n) => n[0]).join('')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{node.name}</h3>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 tracking-wide" style={{ backgroundColor: sb.bg, color: sb.text, border: `1px solid ${sb.border}` }}>
              {sb.icon}{statusLabel}
            </span>
            {signal && getSignalIcon(signal.type)}
            {node.isOnline && (
              <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: 'var(--success)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />Онлайн
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{reason}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onMessage(node); }}
            className="text-[10px] px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 font-medium"
            style={{ backgroundColor: action.bg, color: action.text, border: `1px solid ${action.border}` }}
          >
            {action.label}
          </button>
          <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  };

  const renderGroup = (
    key: string, title: string, color: string, desc: string,
    items: { node: GraphNode; edges: GraphEdge[]; signal?: typeof signals[0] }[]
  ) => {
    if (items.length === 0 || !filterActive(key)) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-5">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</h3>
          <span className="text-[11px] ml-auto" style={{ color: 'var(--text-muted)' }}>{items.length}</span>
        </div>
        <p className="text-[11px] mb-2 px-5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        <div className="space-y-1">
          {items.map((item) => renderCard(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 py-3 px-5" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {LIST_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
              style={{
                borderColor: activeFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                color: activeFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                backgroundColor: activeFilter === f.key ? 'rgba(201,169,110,0.08)' : 'transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-4">
        {renderGroup('attention', 'Требуют внимания', '#ef4444', 'Сигналы заботы — изоляция, перегрузка', attention)}
        {renderGroup('connectors', 'Связующие', '#C9A96E', 'Соединяют группы · носители ткани', connectors)}
        {renderGroup('helpers', 'Готовы помогать', '#6B9E7C', 'Активные помощники · можно пригласить в круг', helpers)}
        {renderGroup('stable', 'Устойчивые', '#9A9895', 'Стабильное движение · могут стать опорой', stable)}
      </div>

      {nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="rounded-xl p-8 text-center max-w-md" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Пока нет участников</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Когда участники начнут взаимодействовать, они появятся здесь.</p>
          </div>
        </div>
      )}
    </div>
  );
}
