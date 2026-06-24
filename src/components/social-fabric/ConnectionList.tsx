import { ChevronRight, HelpCircle } from 'lucide-react';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface ConnectionListProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentUserId: string;
  onNodeClick: (node: GraphNode) => void;
  onMessage: (node: GraphNode) => void;
  selectedNodeId?: string | null;
  activeFilters?: Record<string, boolean>;
  onQuickFilter?: (filters: Record<string, boolean>) => void;
  highlightNodeIds?: Set<string> | null;
}

const ROLE_BADGES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'Помощник по практике': { bg: 'rgba(201,169,110,0.08)', text: '#C9A96E', border: 'rgba(201,169,110,0.2)', glow: 'rgba(201,169,110,0.06)' },
  'Помощник на старт': { bg: 'rgba(184,156,192,0.08)', text: '#B89cc0', border: 'rgba(184,156,192,0.2)', glow: 'rgba(184,156,192,0.06)' },
  'Хранитель знаний': { bg: 'rgba(212,175,55,0.08)', text: '#d4a72c', border: 'rgba(212,175,55,0.2)', glow: 'rgba(212,175,55,0.06)' },
  'Куратор': { bg: 'rgba(236,72,153,0.08)', text: '#ec4899', border: 'rgba(236,72,153,0.2)', glow: 'rgba(236,72,153,0.06)' },
  'Связующий': { bg: 'rgba(107,158,124,0.08)', text: '#6B9E7C', border: 'rgba(107,158,124,0.2)', glow: 'rgba(107,158,124,0.06)' },
};

const HELP_READY_BADGE = { bg: 'rgba(107,158,124,0.08)', text: '#6B9E7C', border: 'rgba(107,158,124,0.2)' };

function getWhyHere(node: GraphNode, ne: GraphEdge[], currentUserId: string): string {
  const helpedMe = ne.filter((e) => e.source === node.id && e.target === currentUserId);
  const iHelped = ne.filter((e) => e.source === currentUserId && e.target === node.id);
  const wasFlow = ne.some((e) => e.type === 'flow');
  const wasMentorship = ne.some((e) => e.type === 'mentorship');
  const wasGratitude = ne.some((e) => e.type === 'gratitude');
  const sharedGoals = node.goals?.length > 0;

  if (wasMentorship && node.role) return `${node.role} · сопровождает · можно обратиться за советом`;
  if (node.isHelpReady && helpedMe.length > 0) return `Помогал раньше · готов помочь снова · ${helpedMe.length} раз`;
  if (node.isHelpReady && iHelped.length > 0) return `Вы помогали · теперь он готов ответить взаимностью`;
  if (node.isHelpReady) return `Готов помочь · можно обратиться с вопросом`;
  if (wasGratitude) return `Есть благодарность · тёплая связь`;
  if (helpedMe.length > 0 && sharedGoals) return `Помогал · похожая цель · ${node.goals[0]}`;
  if (helpedMe.length > 0) return `Помогал · ${helpedMe.length} ${helpedMe.length > 1 ? 'раза' : 'раз'}`;
  if (iHelped.length > 0 && sharedGoals) return `Вы помогали · похожая цель · ${node.goals[0]}`;
  if (iHelped.length > 0) return `Вы помогали · ${iHelped.length} ${iHelped.length > 1 ? 'раза' : 'раз'}`;
  if (wasFlow && sharedGoals) return `Были в одном потоке · похожая цель · ${node.goals[0]}`;
  if (wasFlow) return `Были в одном потоке · общий контекст`;
  if (sharedGoals) return `Похожая цель · ${node.goals[0]} · можно обменяться опытом`;
  return `В сообществе · можно познакомиться`;
}

export function ConnectionList({
  nodes, edges, currentUserId, onNodeClick, onMessage, selectedNodeId,
}: ConnectionListProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8">
        <div className="rounded-xl p-8 text-center max-w-md" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Пока нет связей</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Когда появятся первые взаимодействия, они отобразятся здесь.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      {nodes.map((node) => {
        const ne = edges.filter((e) => e.source === node.id || e.target === node.id);
        const why = getWhyHere(node, ne, currentUserId);
        const isSelected = selectedNodeId === node.id;
        const rb = node.role ? ROLE_BADGES[node.role] : null;

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
                e.currentTarget.style.backgroundColor = rb?.glow || 'var(--hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: node.isOnline ? 'var(--hover-bg)' : 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {node.name.split(' ').map((n) => n[0]).join('')}
              </div>
              {node.isOnline && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: 'var(--success)', borderColor: 'var(--bg-card)' }}
                  title="Онлайн"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{node.name}</h3>
                {/* Status badges */}
                {rb && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 tracking-wide" style={{ backgroundColor: rb.bg, color: rb.text, border: `1px solid ${rb.border}` }}>
                    {node.role}
                  </span>
                )}
                {node.isHelpReady && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ backgroundColor: HELP_READY_BADGE.bg, color: HELP_READY_BADGE.text, border: `1px solid ${HELP_READY_BADGE.border}` }}>
                    <HelpCircle className="w-2.5 h-2.5" /> Готов помочь
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{why}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onMessage(node); }}
                className="text-[10px] px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 font-medium"
                style={{ color: 'var(--gold)', border: '1px solid var(--gold)', background: 'rgba(201,169,110,0.06)' }}
              >
                Написать
              </button>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
