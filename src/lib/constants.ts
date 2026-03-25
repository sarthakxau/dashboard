export const GRAMS_PER_OUNCE = 31.1035;
export const GRAMS_PER_TOLA = 10;
export const XAUT_DECIMALS = 6;

export const MIGRATION_DATE = new Date('2026-03-01T00:00:00Z');
export const ETHERSCAN_TX_URL = 'https://etherscan.io/tx/';
export const ARBISCAN_TX_URL = 'https://arbiscan.io/tx/';

export const CHART_COLORS = {
  blue: '#2563EB',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  violet: '#8B5CF6',
} as const;

export const PAGE_DEFAULTS = {
  overview: '30d',
  users: '30d',
  transactions: '7d',
  portfolio: 'all',
  gifts: '30d',
  health: '7d',
} as const;

export const PAGE_SIZES = [25, 50, 100] as const;

export const PRICE_STALE_THRESHOLD_MS = 5 * 60 * 1000;
