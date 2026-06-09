import { useState } from 'react';
import {
  ChevronRight, Settings,
  Bell, Shield, Users, Eye,
  Palette, Save,
  ChevronDown, Check, AlertTriangle, Zap, HelpCircle
} from 'lucide-react';
import { useToast } from './ToastContext';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';

/* ===== DATA: SETTINGS SECTIONS ===== */
const settingsSections = [
  { key: 'general', label: 'Общие', icon: Settings },
  { key: 'members', label: 'Участники', icon: Users },
  { key: 'roles', label: 'Роли и права', icon: Shield },
  { key: 'notifications', label: 'Уведомления', icon: Bell },
  { key: 'privacy', label: 'Приватность', icon: Eye },
  { key: 'appearance', label: 'Внешний вид', icon: Palette },
] as const;

type SettingsSectionKey = typeof settingsSections[number]['key'];

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'text';
  value: boolean | string;
  options?: string[];
}

const settingsData: Record<SettingsSectionKey, SettingItem[]> = {
  general: [
    { id: 'name', label: 'Название сообщества', description: 'Отображается в хедере и приглашениях', type: 'text', value: 'IT технологии' },
    { id: 'description', label: 'Описание', description: 'Краткое описание для новых участников', type: 'text', value: 'Сообщество для разработчиков, архитекторов и специалистов по ИИ' },
    { id: 'language', label: 'Язык', description: 'Основной язык сообщества', type: 'select', value: 'Русский', options: ['Русский', 'English', 'Deutsch'] },
    { id: 'timezone', label: 'Часовой пояс', description: 'Для планирования встреч', type: 'select', value: 'Москва (UTC+3)', options: ['Москва (UTC+3)', 'Киев (UTC+2)', 'Алматы (UTC+6)', 'Тбилиси (UTC+4)'] },
  ],
  members: [
    { id: 'auto_approve', label: 'Автоодобрение заявок', description: 'Автоматически одобрять заявки без проверки', type: 'toggle', value: false },
    { id: 'max_members', label: 'Лимит участников', description: 'Максимальное количество участников (0 — без ограничения)', type: 'text', value: '0' },
    { id: 'invite_only', label: 'Только по приглашению', description: 'Закрыть публичные заявки, оставить только приглашения', type: 'toggle', value: false },
    { id: 'waitlist', label: 'Лист ожидания', description: 'Добавлять избыточные заявки в лист ожидания', type: 'toggle', value: true },
  ],
  roles: [
    { id: 'helper_limit', label: 'Лимит Помощников на старте', description: 'Сколько новичков может сопровождать один Помощник одновременно', type: 'text', value: '3' },
    { id: 'mentor_approval', label: 'Одобрение менторов', description: 'Требовать одобрения от лидера для назначения ментора', type: 'toggle', value: true },
    { id: 'expert_badge', label: 'Значки экспертов', description: 'Показывать значки экспертизы рядом с аватарами', type: 'toggle', value: true },
  ],
  notifications: [
    { id: 'new_app', label: 'Новые заявки', description: 'Уведомлять о новых заявках на вступление', type: 'toggle', value: true },
    { id: 'urgent_req', label: 'Срочные запросы', description: 'Уведомлять о запросах без ответа > 24 часов', type: 'toggle', value: true },
    { id: 'payment_issues', label: 'Проблемы с оплатой', description: 'Уведомлять о неудачных платежах', type: 'toggle', value: true },
    { id: 'weekly_digest', label: 'Еженедельный дайджест', description: 'Получать сводку активности за неделю', type: 'toggle', value: true },
    { id: 'pulse_drop', label: 'Падение Пульса', description: 'Уведомлять, когда Пульс падает ниже 60', type: 'toggle', value: true },
  ],
  privacy: [
    { id: 'public_profiles', label: 'Публичные профили', description: 'Профили участников видны незарегистрированным пользователям', type: 'toggle', value: false },
    { id: 'show_online', label: 'Статус онлайн', description: 'Показывать, кто сейчас в сети', type: 'toggle', value: true },
    { id: 'show_contribution', label: 'Видимость Вклада', description: 'Участники могут видеть Вклад друг друга', type: 'toggle', value: true },
    { id: 'data_export', label: 'Экспорт данных', description: 'Разрешить участникам экспортировать свои данные', type: 'toggle', value: true },
  ],
  appearance: [
    { id: 'default_theme', label: 'Тема по умолчанию', description: 'Какая тема будет у новых участников', type: 'select', value: 'Тёмная', options: ['Тёмная', 'Светлая', 'Системная'] },
    { id: 'custom_brand', label: 'Кастомный брендинг', description: 'Использовать собственные цвета и логотип', type: 'toggle', value: false },
    { id: 'compact_mode', label: 'Компактный режим', description: 'Уменьшить отступы и размеры элементов', type: 'toggle', value: false },
  ],
};

/* ===== COMPONENT ===== */
export default function LeaderConsoleSettings() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>('general');
  const [settings, setSettings] = useState(settingsData);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [changedSettings, setChangedSettings] = useState<Set<string>>(new Set());

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  const handleToggle = (section: SettingsSectionKey, id: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, value: !item.value } : item
      ),
    }));
    setHasChanges(true);
    setChangedSettings(prev => new Set(prev).add(id));
  };

  const handleChange = (section: SettingsSectionKey, id: string, newValue: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, value: newValue } : item
      ),
    }));
    setHasChanges(true);
    setChangedSettings(prev => new Set(prev).add(id));
  };

  const handleSave = () => {
    showToast('Настройки сохранены', 'success');
    setHasChanges(false);
    setChangedSettings(new Set());
    setShowSaveConfirm(false);
  };

  const currentSettings = settings[activeSection];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Настройки</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Настройки
                </h1>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Управление параметрами сообщества: участники, роли, уведомления, приватность и внешний вид.
                </p>
              </div>
              {hasChanges && (
                <button
                  onClick={() => setShowSaveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 shrink-0"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Сохранить</span>
                </button>
              )}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== SETTINGS TABS ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex flex-wrap gap-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200`}
                    style={{
                      backgroundColor: activeSection === section.key ? 'var(--hover-bg)' : 'transparent',
                      color: activeSection === section.key ? 'var(--gold)' : 'var(--text-secondary)',
                      border: activeSection === section.key ? '1px solid var(--gold)' : '1px solid transparent',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== SETTINGS CONTENT ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="space-y-5">
              {currentSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: changedSettings.has(setting.id) ? GOLD_GLOW : 'transparent',
                    border: changedSettings.has(setting.id) ? `1px solid rgba(201,169,110,0.15)` : '1px solid transparent',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{setting.label}</p>
                      {changedSettings.has(setting.id) && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{setting.description}</p>
                  </div>

                  <div className="shrink-0">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => handleToggle(activeSection, setting.id)}
                        className="relative w-11 h-6 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: setting.value ? 'var(--gold)' : 'var(--border-color)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: '#fff',
                            transform: setting.value ? 'translateX(20px)' : 'translateX(0)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    )}

                    {setting.type === 'select' && (
                      <div className="relative">
                        <select
                          value={setting.value as string}
                          onChange={(e) => handleChange(activeSection, setting.id, e.target.value)}
                          className="appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-medium cursor-pointer outline-none transition-all duration-200"
                          style={{
                            backgroundColor: 'var(--hover-bg)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {setting.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}

                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value as string}
                        onChange={(e) => handleChange(activeSection, setting.id, e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs outline-none transition-all duration-200 w-40 md:w-56"
                        style={{
                          backgroundColor: 'var(--hover-bg)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unsaved changes banner */}
          {hasChanges && (
            <div className="px-6 md:px-8 pb-6 section-fade-in">
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Есть несохранённые изменения ({changedSettings.size})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSettings(settingsData);
                      setHasChanges(false);
                      setChangedSettings(new Set());
                      showToast('Изменения отменены', 'info');
                    }}
                    className="px-3 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    Отменить
                  </button>
                  <button
                    onClick={() => setShowSaveConfirm(true)}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== MODAL: Save Confirm ===== */}
      {showSaveConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowSaveConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Сохранить изменения</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Будут применены изменения в {changedSettings.size} {changedSettings.size === 1 ? 'настройке' : changedSettings.size < 5 ? 'настройках' : 'настройках'}. Участники получат уведомления, если это затрагивает их права или видимость.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Продолжить редактирование
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT PANEL ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* Current settings summary */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Текущие параметры</h3>
          <div className="space-y-3">
            {[
              { label: 'Автоодобрение', value: settings.members.find(s => s.id === 'auto_approve')?.value ? 'Включено' : 'Выключено', active: !!settings.members.find(s => s.id === 'auto_approve')?.value },
              { label: 'Лимит участников', value: (settings.members.find(s => s.id === 'max_members')?.value as string) === '0' ? 'Без ограничения' : `${settings.members.find(s => s.id === 'max_members')?.value} чел.`, active: true },
              { label: 'Лимит Помощников', value: `${settings.roles.find(s => s.id === 'helper_limit')?.value} новичка`, active: true },
              { label: 'Публичные профили', value: settings.privacy.find(s => s.id === 'public_profiles')?.value ? 'Включено' : 'Выключено', active: !!settings.privacy.find(s => s.id === 'public_profiles')?.value },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span className="text-xs font-medium" style={{ color: item.active ? SAGE : 'var(--text-muted)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk alert */}
        {!settings.roles.find(s => s.id === 'mentor_approval')?.value && (
          <div className="sidebar-section" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: TERRACOTTA }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TERRACOTTA }}>Внимание</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Отключено одобрение менторов. Любой участник может назначить себя ментором без проверки.
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Подсказки</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Настройки применяются сразу после сохранения</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Участники получат уведомление об изменениях прав</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Отменённые изменения можно восстановить</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
