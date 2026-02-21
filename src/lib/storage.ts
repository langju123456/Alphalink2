import { TradeIdea, Highlight, Invite, UserSession } from './types';

const STORAGE_KEYS = {
  SESSION: 'al_session',
  IDEAS: 'al_ideas',
  HIGHLIGHTS: 'al_highlights',
  INVITES: 'al_invites',
};

export const ADMIN_BOOTSTRAP_CODE = 'ALPHA_ADMIN_2024';

export const storage = {
  saveSession: (session: UserSession) => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },
  getSession: (): UserSession | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getIdeas: (): TradeIdea[] => {
    const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return data ? JSON.parse(data) : [];
  },
  saveIdea: (idea: TradeIdea) => {
    const ideas = storage.getIdeas();
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify([idea, ...ideas]));
  },

  getHighlights: (): Highlight[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    return data ? JSON.parse(data) : [];
  },
  saveHighlight: (highlight: Highlight) => {
    const h = storage.getHighlights();
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify([highlight, ...h]));
  },
  deleteHighlight: (id: string) => {
    const h = storage.getHighlights().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(h));
  },

  getInvites: (): Invite[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITES);
    return data ? JSON.parse(data) : [];
  },
  saveInvite: (invite: Invite) => {
    const invites = storage.getInvites();
    localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify([invite, ...invites]));
  },
  updateInviteStatus: (id: string, status: 'active' | 'disabled') => {
    const invites = storage.getInvites().map(inv => inv.id === id ? { ...inv, status } : inv);
    localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
  }
};