import { X, Users, HelpCircle, Clock, MessageCircle, TrendingUp, Handshake, UserPlus, Heart } from 'lucide-react';
import type { GraphNode, GraphEdge } from '@/data/graphData';

interface RingCardProps {
  ringIndex: number;
  ringLabel: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
  onNodeClick: (node: GraphNode) => void;
}

const RING_DATA: Record<number, {
  title: string;
  color: string;
  description: string;
  meaning: string;
  emptyText: string;
  actions: { icon: typeof MessageCircle; label: string }[];
}> = {
  0: {
    title: 'Опоры',
    color: '#fbbf24',
    description: 'Устойчивые связи: люди, к которым можно обратиться за поддержкой.',
    meaning: '«У меня есть на кого опереться»',
    emptyText: 'Опоры ещё формируются. Здесь появятся люди, с которыми возникнет доверие и регулярная помощь. Обратитесь к помощнику на старт.',
    actions: [
      { icon: MessageCircle, label: 'Попросить совет' },
      { icon: Heart, label: 'Поблагодарить' },
      { icon: Handshake, label: 'Обменяться опытом' },
    ],
  },
  1: {
    title: 'Близкие',
    color: '#C9A96E',
    description: 'Тёплые связи: помощь, разбор, благодарность или общий шаг.',
    meaning: '«Связь тёплая, её можно продолжить»',
    emptyText: 'Тёплые связи появятся, когда вы начнёте взаимодействовать через помощь, разборы или общие шаги.',
    actions: [
      { icon: MessageCircle, label: 'Написать' },
      { icon: TrendingUp, label: 'Продолжить контакт' },
      { icon: Handshake, label: 'Предложить помощь' },
    ],
  },
  2: {
    title: 'Коллеги',
    color: '#2dd4bf',
    description: 'Общий контекст: похожий трек, тема, цель или поток.',
    meaning: '«Мы рядом по пути»',
    emptyText: 'Коллеги по пути появятся. Пройдите шаг или присоединитесь к потоку — здесь появятся люди с похожим контекстом.',
    actions: [
      { icon: MessageCircle, label: 'Обменяться опытом' },
      { icon: UserPlus, label: 'Написать по теме' },
      { icon: Handshake, label: 'Предложить помощь' },
    ],
  },
  3: {
    title: 'Знакомые',
    color: '#9A9895',
    description: 'Слабая связь: контакт уже был, но связь не стала устойчивой.',
    meaning: '«Контакт был, связь можно оживить»',
    emptyText: 'Слабые связи ещё не появились. Они формируются из первых контактов — встреч, потоков, комментариев.',
    actions: [
      { icon: MessageCircle, label: 'Мягко оживить' },
      { icon: Heart, label: 'Поблагодарить' },
      { icon: TrendingUp, label: 'Предложить помощь' },
    ],
  },
  4: {
    title: 'Потенциальные',
    color: '#6A6865',
    description: 'Связи ещё нет, но есть хороший повод познакомиться.',
    meaning: '«Здесь может появиться новая поддержка»',
    emptyText: 'Новые связи ещё не найдены. Когда появятся люди с похожим шагом или темой — мы покажем их здесь.',
    actions: [
      { icon: UserPlus, label: 'Познакомиться' },
      { icon: MessageCircle, label: 'Попросить совет' },
      { icon: Handshake, label: 'Обменяться опытом' },
    ],
  },
};

export function RingCard({ ringIndex, ringLabel, nodes, edges, onClose, onNodeClick }: RingCardProps) {
  const data = RING_DATA[ringIndex];
  if (!data) return null;
  void ringLabel; // used for consistency with parent

  // Filter nodes for this ring (synced with CirclesTopology)
  const ringNodes = nodes.filter((node) => {
    const edge = edges.find(
      (e) => (e.source === 'me' && e.target === node.id) ||
             (e.target === 'me' && e.source === node.id)
    );
    const weight = edge?.weight ?? 0;

    switch (ringIndex) {
      case 0: return weight >= 7;
      case 1: return weight >= 5 && weight < 7;
      case 2: return weight >= 3 && weight < 5;
      case 3: return weight >= 1 && weight < 3;
      case 4: return weight === 0;
      default: return false;
    }
  });

  const count = ringNodes.length;
  const helpReady = ringNodes.filter((n) => n.isHelpReady).length;
  const online = ringNodes.filter((n) => n.isOnline).length;

  // Find stale connections
  const stale = ringNodes.filter((node) => {
    const edge = edges.find(
      (e) => (e.source === 'me' && e.target === node.id) ||
             (e.target === 'me' && e.source === node.id)
    );
    if (!edge) return false;
    const days = Math.floor((new Date('2026-06-17').getTime() - new Date(edge.lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
    return days > 14;
  }).length;

  // Dynamic conclusion
  let conclusion = '';
  if (count === 0) {
    conclusion = data.emptyText;
  } else if (ringIndex === 0 && count >= 2) {
    conclusion = `У вас ${count} опор — это хорошая поддержка. Можно попросить совет или поблагодарить.`;
  } else if (ringIndex === 3 && count >= 2) {
    conclusion = `В этом круге ${count} человек, но связь слабая. Напишите одному из них — это мягкий шаг вперёд.`;
  } else if (ringIndex === 4 && count >= 1) {
    conclusion = `Есть ${count} возможностью для новой связи. Попробуйте — начните с короткого сообщения.`;
  } else {
    conclusion = `В этом круге ${count} человек. Попробуйте одно из предложенных действий.`;
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: data.color, boxShadow: `0 0 8px ${data.color}40` }} />
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">{data.title}</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{data.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meaning */}
      <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
        <p className="text-xs text-[var(--text-secondary)] italic">{data.meaning}</p>
      </div>

      {/* Stats */}
      {count > 0 ? (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{count} {count === 1 ? 'человек' : count < 5 ? 'человека' : 'человек'}</span>
          </div>
          {helpReady > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{helpReady} {helpReady === 1 ? 'готов помочь' : 'готовы помочь'}</span>
            </div>
          )}
          {online > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{online} онлайн</span>
            </div>
          )}
          {stale > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{stale} связь давно не обновлялась</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 px-3 py-3 rounded-lg" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{data.emptyText}</p>
        </div>
      )}

      {/* Conclusion */}
      <div className="mb-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(201,169,110,0.12)' }}>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{conclusion}</p>
      </div>

      {/* Actions */}
      {count > 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Что можно сделать</span>
          <div className="mt-2 space-y-1.5">
            {data.actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <action.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People in ring */}
      {count > 0 && (
        <div>
          <div className="mb-2" style={{ borderTop: '1px solid var(--border-color)' }} />
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">В этом круге</span>
          <div className="mt-2 space-y-1.5">
            {ringNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => onNodeClick(node)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold bg-[var(--hover-bg)] text-[var(--text-secondary)] shrink-0">
                  {node.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-[var(--text-secondary)] truncate block">{node.name}</span>
                  {node.isHelpReady && (
                    <span className="text-[10px] text-emerald-500">Готов помочь</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
