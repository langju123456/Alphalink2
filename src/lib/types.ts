
export type Role = 'admin' | 'member';
export type Tier = 'standard' | 'vip' | 'premium';

export interface UserSession {
  role: Role;
  tier: Tier;
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
  createdAt: any; 
  createdBy: string;
  likeCount: number;
  
  ticker?: string;
  direction?: 'LONG' | 'SHORT';
  action?: 'BUY' | 'SELL' | 'HOLD';
  timeframe?: 'SCALP' | 'SWING' | 'LONG';
  entryPlan?: string;
  stopLoss?: string;
  invalidation?: string;

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
  role: Role;
  tier: Tier;
  status: 'active' | 'disabled';
  createdAt: any;
  usedCount: number;
}
