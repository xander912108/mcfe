import { HelpCircle, MessageSquare, Users } from 'lucide-react';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface NodeTooltipProps {
  node: GraphNode;
  edges: GraphEdge[];
  currentUserId: string;
}

export function NodeTooltip({ node, edges, currentUserId }: NodeTooltipProps) {
  const connectionCount = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  ).length;

  const recentHelp = edges.filter(
    (e) => e.target === currentUserId && e.source === node.id && e.type === 'help'
  ).length;

  return (
    <div className="absolute pointer-events-none z-50 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl text-white rounded-xl px-4 py-3.5 shadow-2xl shadow-indigo-500/10 border max-w-xs" style={{ borderColor: 'rgba(201,169,110,0.24)', boxShadow: '0 18px 45px rgba(0,0,0,0.28), 0 0 0 1px rgba(201,169,110,0.08), 0 0 28px rgba(99,102,241,0.10)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
              node.id === 'me' || node.id === 'community'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-[var(--hover-bg)]/50 text-[var(--text-secondary)] border-[var(--border-color)]/30'
            }`}
          >
            {node.id === 'me' ? 'Я' : node.id === 'community' ? 'MC' : node.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sm text-[var(--text-primary)] block truncate">{node.name}</span>
            {node.role && (
              <span className="text-xs text-[var(--text-muted)] block truncate">{node.role}</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          {recentHelp > 0 && (
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Помог вам {recentHelp} раз</span>
            </div>
          )}
          {connectionCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              <span>{connectionCount} связей в сообществе</span>
            </div>
          )}
          {node.isHelpReady && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-medium">Готов помочь</span>
            </div>
          )}
          {node.competencies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {node.competencies.map((c) => (
                <span key={c} className="bg-[var(--hover-bg)]/80 text-[var(--text-secondary)] border border-[var(--border-color)] px-2 py-0.5 rounded-md text-xs">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-card)] rotate-45 border-r border-b" style={{ borderColor: 'rgba(201,169,110,0.24)' }} />
      </div>
    </div>
  );
}
