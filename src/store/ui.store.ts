import { useSyncExternalStore } from 'react';
import type { Theme } from '@/lib/theme/themeManager';

type Listener = () => void;

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  commandPaletteOpen: boolean;
  theme: Theme;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setTheme: (theme: Theme) => void;
}

type UIStore = UIState & UIActions;

const STORAGE_KEY = 'mentori-ui-store';

function readPersistedState(): Pick<UIState, 'sidebarCollapsed' | 'theme'> {
  if (typeof localStorage === 'undefined') return { sidebarCollapsed: false, theme: 'system' };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sidebarCollapsed: false, theme: 'system' };

    const parsed = JSON.parse(raw) as Partial<Pick<UIState, 'sidebarCollapsed' | 'theme'>>;
    return {
      sidebarCollapsed: parsed.sidebarCollapsed ?? false,
      theme: parsed.theme ?? 'system',
    };
  } catch {
    return { sidebarCollapsed: false, theme: 'system' };
  }
}

const persistedState = readPersistedState();
let state: UIState = {
  sidebarCollapsed: persistedState.sidebarCollapsed,
  activeModal: null,
  modalData: null,
  commandPaletteOpen: false,
  theme: persistedState.theme,
};

const listeners = new Set<Listener>();

function persistState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    );
  } catch {
    // localStorage недоступен — UI продолжает работать без persistence.
  }
}

function setState(partial: Partial<UIState>) {
  state = { ...state, ...partial };
  storeSnapshot = { ...state, ...actions };
  persistState();
  listeners.forEach((listener) => listener());
}

let storeSnapshot: UIStore;

const actions: UIActions = {
  toggleSidebar: () => setState({ sidebarCollapsed: !state.sidebarCollapsed }),
  setSidebarCollapsed: (collapsed) => setState({ sidebarCollapsed: collapsed }),
  openModal: (id, data) => setState({ activeModal: id, modalData: data ?? null }),
  closeModal: () => setState({ activeModal: null, modalData: null }),
  openCommandPalette: () => setState({ commandPaletteOpen: true }),
  closeCommandPalette: () => setState({ commandPaletteOpen: false }),
  setTheme: (theme) => setState({ theme }),
};

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

storeSnapshot = { ...state, ...actions };

function getSnapshot(): UIStore {
  return storeSnapshot;
}

/**
 * Dependency-free UI store с тем же назначением, что будущий Zustand store.
 * Server state здесь не хранится: users/communities/applications должны жить в query layer.
 */
export function useUIStore(): UIStore {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
