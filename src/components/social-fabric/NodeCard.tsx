import { X, MessageCircle, Heart, HelpCircle, Eye, Users, Clock, Award, ArrowRight, Lightbulb, Activity, TrendingUp, Minus, MapPin, Star, Zap, AlertTriangle } from 'lucide-react';
import type { GraphNode, GraphEdge, BridgeContext } from '@/data/graphData';

interface NodeCardProps {
  node: GraphNode;
  edges: GraphEdge[];
  currentUserId: string;
  onClose: () => void;
  mode: 'participant' | 'leader';
  ringLabel?: string;
  period?: number;
  clusterName?: string;
  clusterRole?: 'core' | 'periphery' | 'bridge' | 'isolated' | null;
  statusExplanation?: string;
  bridgeContexts?: BridgeContext[];
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Помощник по практике': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
  'Помощник на старт': { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20' },
  'Хранитель знаний': { bg: 'bg-yellow-500/10', text: 'text-yellow-300', border: 'border-yellow-500/20' },
  'Куратор': { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20' },
  'Связующий': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
};

const RING_EXPLANATIONS: Record<string, { why: string; action: string }> = {
  'Опоры': {
    why: 'сильная связь — помогал вам и готов поддержать',
    action: 'Попросить помощь по вашему шагу или обменяться опытом',
  },
  'Близкие': {
    why: 'полезное взаимодействие — помощь, разбор или общий трек',
    action: 'Написать и уточнить, чем можете быть полезны друг другу',
  },
  'Коллеги': {
    why: 'общий контекст — трек, поток или похожий шаг',
    action: 'Спросить про опыт прохождения шага или поделиться своим',
  },
  'Знакомые': {
    why: 'слабая связь — можно мягко усилить живым действием',
    action: 'Начать с короткого сообщения — спросить про общие интересы',
  },
  'Потенциальные': {
    why: 'связи ещё нет, но есть хороший повод познакомиться',
    action: 'Начать с повода — общий трек, тема или через знакомого',
  },
};

export function NodeCard({ node, edges, currentUserId, onClose, mode, ringLabel, period, clusterName, clusterRole, statusExplanation, bridgeContexts }: NodeCardProps) {
  const incomingEdges = edges.filter((e) => e.target === node.id && e.source === currentUserId);
  const outgoingEdges = edges.filter((e) => e.source === node.id && e.target === currentUserId);
  const allEdges = [...incomingEdges, ...outgoingEdges];

  const edgeTypeLabels: Record<string, string> = {
    help: 'Помощь',
    review: 'Разбор',
    flow: 'Вместе в потоке',
    mentorship: 'Наставничество',
    gratitude: 'Благодарность',
    mutual: 'Взаимная помощь',
  };

  const roleStyle = node.role ? ROLE_COLORS[node.role] || { bg: 'bg-stone-500/10', text: 'text-[var(--text-secondary)]', border: 'border-stone-500/20' } : null;
  const ringExplanation = ringLabel ? RING_EXPLANATIONS[ringLabel] : null;

  // Find bridge contexts for this node (how to approach)
  const nodeBridges = bridgeContexts?.filter((b) => b.targetId === node.id) || [];
  const hasBridge = nodeBridges.length > 0;

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 ${
              node.id === 'me'
                ? 'bg-amber-600 text-white ring-2 ring-amber-500/30'
                : node.isOnline
                ? 'bg-[var(--hover-bg)] text-[var(--text-primary)]'
                : 'bg-[var(--hover-bg)] text-[var(--text-secondary)]'
            }`}
          >
            {node.id === 'me' ? 'Я' : node.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm">{node.name}</h3>
            {roleStyle && (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border}`}>
                {node.role}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-4">
        <span className={`w-2 h-2 rounded-full ${node.isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-stone-600'}`} />
        {node.isOnline ? 'Онлайн' : 'Был недавно'}
        {node.isHelpReady && (
          <span className="ml-2 flex items-center gap-1 text-emerald-400">
            <HelpCircle className="w-3 h-3" />
            Готов помочь
          </span>
        )}
      </div>

      {/* Why this status (leader-only, for Health topology) */}
      {mode === 'leader' && statusExplanation && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.12)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Почему такой статус</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {statusExplanation}
          </p>
        </div>
      )}

      {/* Why here (for Circles) */}
      {ringExplanation && mode === 'participant' && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.12)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Почему здесь</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {node.name.split(' ')[0]} {ringExplanation.why}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            {ringExplanation.action}
          </p>
        </div>
      )}

      {/* Bridge: How to approach (participant) */}
      {mode === 'participant' && hasBridge && (
        <div className="mb-4 space-y-2">
          {nodeBridges.map((bridge, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(107, 158, 124, 0.08)', border: '1px solid rgba(107, 158, 124, 0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {bridge.type === 'person_bridge' ? (
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  {bridge.type === 'person_bridge' ? 'Через кого' : 'Как подойти'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {bridge.description}
              </p>
              {bridge.viaPersonName && (
                <p className="text-xs text-[var(--text-muted)] mt-1.5">
                  Посредник: <span className="text-teal-400">{bridge.viaPersonName}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connection history */}
      {allEdges.length > 0 && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            История связи
          </h4>
          <div className="space-y-2">
            {allEdges.map((edge, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">{edgeTypeLabels[edge.type] || edge.type}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-1 h-1 rounded-full"
                        style={{ background: j < edge.weight ? 'rgba(201,169,110,0.6)' : 'var(--border-color)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{edge.lastInteraction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competencies & Goals */}
      <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {node.competencies.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Компетенции</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {node.competencies.map((c) => (
                <span key={c} className="text-xs bg-[var(--hover-bg)] text-[var(--text-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {node.goals.length > 0 && (
          <div>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Цели</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {node.goals.map((g) => (
                <span key={g} className="text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/15">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leader-only: State */}
      {mode === 'leader' && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Состояние
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Вклад: уровень {node.contributionLevel}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Связей: {allEdges.length}</span>
            </div>
            {node.status === 'stuck' && (
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Требует внимания</span>
              </div>
            )}
            {node.status === 'burnout_risk' && (
              <div className="flex items-center gap-2 text-orange-400">
                <Award className="w-3.5 h-3.5" />
                <span>Нужна поддержка</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leader-only: Place in cluster */}
      {mode === 'leader' && clusterRole && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Место в группе
          </h4>
          {(() => {
            const roleTexts: Record<string, { icon: React.ReactNode; title: string; desc: string; accent: string }> = {
              core: { icon: <MapPin className="w-3.5 h-3.5" />, title: 'Близко к ядру', desc: `${node.name.split(' ')[0]} активно взаимодействует с группой${clusterName ? ` «${clusterName}»` : ''}. Может быть хорошей опорой для новичков.`, accent: 'text-emerald-400' },
              periphery: { icon: <MapPin className="w-3.5 h-3.5" />, title: 'На периферии', desc: `${node.name.split(' ')[0]} рядом с группой${clusterName ? ` «${clusterName}»` : ''}, но мало связей с ядром. Стоит познакомить с активными участниками.`, accent: 'text-amber-400' },
              bridge: { icon: <Star className="w-3.5 h-3.5" />, title: 'Связующий', desc: `${node.name.split(' ')[0]} соединяет разные части сообщества. Важный носитель социальной ткани.`, accent: 'text-amber-300' },
              isolated: { icon: <MapPin className="w-3.5 h-3.5" />, title: 'Нужна первая связь', desc: `${node.name.split(' ')[0]} пока не вошёл в устойчивые связи. Точка заботы для сообщества — стоит мягко подобрать помощника.`, accent: 'text-red-400' },
            };
            const r = roleTexts[clusterRole];
            return (
              <div>
                <div className={`flex items-center gap-2 ${r.accent} mb-1.5`}>
                  {r.icon}
                  <span className="text-xs font-medium">{r.title}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {r.desc}
                </p>
                {clusterName && clusterRole !== 'isolated' && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    Группа: <span className="text-[var(--text-secondary)]">{clusterName}</span>
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Leader-only: Pulse for period */}
      {mode === 'leader' && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Пульс за {period || 7} дней
          </h4>
          {(() => {
            const avgWeight = allEdges.length > 0 ? allEdges.reduce((s, e) => s + e.weight, 0) / allEdges.length : 0;
            const activityLevel = avgWeight > 6 ? 'высокая' : avgWeight > 3 ? 'средняя' : allEdges.length > 0 ? 'низкая' : 'нет данных';
            const activityColor = avgWeight > 6 ? 'text-emerald-400' : avgWeight > 3 ? 'text-amber-400' : allEdges.length > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]';
            const ActivityIcon = allEdges.length > 0 ? TrendingUp : Minus;
            const maxInteraction = allEdges.length > 0 ? allEdges.reduce((max, e) => e.lastInteraction > max ? e.lastInteraction : max, allEdges[0].lastInteraction) : null;
            return (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">Активность:</span>
                  <span className={`font-medium ${activityColor} flex items-center gap-1`}>
                    <ActivityIcon className="w-3 h-3" />
                    {activityLevel}
                  </span>
                </div>
                {allEdges.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Связей: <span className="text-[var(--text-secondary)] font-medium">{allEdges.length}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Средняя сила: <span className="text-[var(--text-secondary)] font-medium">{avgWeight.toFixed(1)}</span> / 10</span>
                    </div>
                  </>
                )}
                {maxInteraction && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Последнее действие: <span className="text-[var(--text-secondary)] font-medium">{maxInteraction}</span></span>
                  </div>
                )}
                {allEdges.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-1">
                    Участник пока не вошел в живые связи — точка заботы для сообщества.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.15)'; }}>
            <MessageCircle className="w-4 h-4" />
            Написать
          </button>
          {allEdges.length > 0 && (
            <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: 'var(--border-color)', color: '#9A9895', border: '1px solid var(--border-color)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--border-color)'; }}>
              <Heart className="w-4 h-4" />
              Поблагодарить
            </button>
          )}
          {allEdges.length === 0 && (
            <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; }}>
              <Users className="w-4 h-4" />
              {mode === 'leader' ? 'Подобрать наставника' : 'Подобрать помощника'}
            </button>
          )}
        </div>

        {/* Status-based CTA (leader only) */}
        {mode === 'leader' && (
          <div className="pt-2">
            {node.status === 'inactive' && (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; }}>
                <Users className="w-4 h-4" />
                Подобрать наставника
              </button>
            )}
            {node.status === 'stuck' && allEdges.length > 0 && (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)'; }}>
                <Zap className="w-4 h-4" />
                Предложить помощь по шагу
              </button>
            )}
            {node.status === 'burnout_risk' && (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; }}>
                <Heart className="w-4 h-4" />
                Разгрузить / найти помощника
              </button>
            )}
            {node.status === 'active' && node.contributionLevel >= 5 && (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(34,197,94,0.10)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.10)'; }}>
                <Award className="w-4 h-4" />
                Предложить роль
              </button>
            )}
          </div>
        )}
      </div>

      {/* How to strengthen connection (participant) */}
      {mode === 'participant' && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Связь становится ближе, когда появляется живое действие: вопрос, помощь, благодарность или общий шаг.
          </p>
        </div>
      )}
    </div>
  );
}
