import { Crown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { navigationConfig } from '@/lib/navigation/config';
import { getNavigationLabel } from '@/lib/navigation/labels';

const participantSidebarItems = navigationConfig.filter(
  (item) => item.surface === 'participant' && item.binding.owner === 'app-shell',
);

export function ParticipantSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-1 flex-1">
        {participantSidebarItems.map((item) => {
          const isActive = item.path === location.pathname;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer' }}
            >
              <Icon className="nav-icon" /><span>{getNavigationLabel(item)}</span>
            </div>
          );
        })}
      </nav>
      {/* Leader Console CTA */}
      <div className="pt-4 pb-2 px-1">
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
        <button
          onClick={() => navigate('/leader')}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group"
          style={{
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.2)',
            color: '#fff',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(212, 175, 55, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Crown className="w-4 h-4" />
          <span>Консоль лидера</span>
        </button>
      </div>
    </div>
  );
}
