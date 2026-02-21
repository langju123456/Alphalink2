export type Role = 'admin' | 'member';

export interface UserSession {
  role: Role;
  accessCode: string;
  loggedInAt: number;
}

export type InstrumentType = 'STOCK' | 'OPTIONS';

export interface OptionLeg {
  side: 'BUY' | 'SELL';
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  contracts: number;
}

export interface TradeIdea {
  id: string;
  instrumentType: InstrumentType;
  note: string;
  aiSummaryBullets: string[];
  riskLine: string;
  payoffHint: string;
  createdAt: number;
  createdBy: string;
  likeCount: number;
  
  // Stock specific
  ticker?: string;
  direction?: 'LONG' | 'SHORT';
  action?: 'BUY' | 'SELL' | 'HOLD';
  timeframe?: 'SCALP' | 'SWING' | 'LONG';
  entryPlan?: string;
  stopLoss?: string;
  invalidation?: string;

  // Options specific
  underlying?: string;
  strategyType?: 'SINGLE' | 'VERTICAL_SPREAD';
  legs?: OptionLeg[];
}

export interface Highlight {
  id: string;
  title: string;
  ticker: string;
  returnPct: number;
  date: string;
  description: string;
  createdAt: number;
}

export interface Invite {
  id: string;
  code: string; // Plain code for MVP display once
  role: 'member';
  status: 'active' | 'disabled';
  createdAt: number;
  usedCount: number;
}