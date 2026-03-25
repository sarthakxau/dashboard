import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { GRAMS_PER_OUNCE } from './constants';
import type { Unit, LatestPrice } from '@/types';

export function formatINR(amount: number | string | Decimal): string {
  const num = new Decimal(amount).toNumber();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatUSD(amount: number | string | Decimal): string {
  const num = new Decimal(amount).toNumber();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatGrams(grams: number | string | Decimal): string {
  const num = new Decimal(grams);
  return `${num.toFixed(4)} g`;
}

export function formatPercent(value: number | string | Decimal): string {
  const num = new Decimal(value).toNumber();
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format date as dd/mm/yy */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy');
}

/** Format date with time as dd/mm/yy HH:mm */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy HH:mm');
}

export function formatValue(
  xautAmount: number | string | Decimal,
  unit: Unit,
  price: LatestPrice,
): string {
  const xaut = new Decimal(xautAmount);
  switch (unit) {
    case 'Grams':
      return formatGrams(xaut.times(GRAMS_PER_OUNCE));
    case 'USD':
      return formatUSD(xaut.times(price.gold_price_usd));
    case 'INR':
      return formatINR(xaut.times(price.gold_price_inr));
  }
}

export function formatINRValue(
  inrAmount: number | string | Decimal,
  unit: Unit,
  price: LatestPrice,
): string {
  const inr = new Decimal(inrAmount);
  switch (unit) {
    case 'INR':
      return formatINR(inr);
    case 'USD':
      return formatUSD(inr.dividedBy(price.usd_inr_rate));
    case 'Grams': {
      const usd = inr.dividedBy(price.usd_inr_rate);
      const ounces = usd.dividedBy(price.gold_price_usd);
      return formatGrams(ounces.times(GRAMS_PER_OUNCE));
    }
  }
}

export function getExplorerUrl(txHash: string, createdAt: string): string {
  const txDate = new Date(createdAt);
  const migrationDate = new Date('2026-03-01T00:00:00Z');
  const baseUrl = txDate < migrationDate
    ? 'https://arbiscan.io/tx/'
    : 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
