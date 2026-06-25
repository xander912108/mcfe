import React from 'react';
import { X } from 'lucide-react';

interface CommunityFabricDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityFabricDrawer: React.FC<CommunityFabricDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[320px] z-50 flex flex-col p-5"
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Ткань сообщества</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Метрики и сигналы будут добавлены в следующем обновлении.</p>
      </div>
    </>
  );
};
