
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
  createdAt: any; // Can be number or Firestore Timestamp
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
  tickerOrUnderlying: string;
  returnPct: number;
  date: string;
  description: string;
  createdAt: any;
}

export interface Invite {
  id: string;
  code: string;
  label?: string;
  role: 'member' | 'admin';
  status: 'active' | 'disabled';
  createdAt: any;
  usedCount: number;
}
