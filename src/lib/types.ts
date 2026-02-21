
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
  userId: string; // 关联发布者的 UID
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
  recipient?: string;
  role: Role;
  status: 'active' | 'disabled';
  createdAt: any;
  usedCount: number;
}

export interface UserProfile {
  uid: string;
  role: Role;
  displayName?: string;
  contactType?: 'email' | 'other';
  contactInfo?: string;
  accessCode: string;
  createdAt: any;
  updatedAt: any;
}
