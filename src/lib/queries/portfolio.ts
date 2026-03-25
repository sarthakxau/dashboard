import { supabase } from '@/lib/supabase';
import Decimal from 'decimal.js';
import { GRAMS_PER_OUNCE } from '@/lib/constants';
import type { LatestPrice } from '@/types';

export interface PortfolioMetrics {
  totalXaut: number;
  totalXautGrams: number;
  tvlINR: number;
  totalInvested: number;
  usersInProfit: number;
  usersInLoss: number;
  avgPnl: number;
}

export interface HoldingBucket {
  range: string;
  count: number;
}

export interface TopHolder {
  userId: string;
  xautAmount: number;
  grams: number;
  totalInvested: number;
  pnl: number;
  saverLevel: number;
}

export async function fetchPortfolioMetrics(price: LatestPrice): Promise<PortfolioMetrics> {
  const { data, error } = await supabase.from('holdings').select('xaut_amount, total_invested_inr, unrealized_pnl_inr');
  if (error) throw new Error(error.message);

  let totalXaut = new Decimal(0);
  let totalInvested = new Decimal(0);
  let inProfit = 0, inLoss = 0;
  const pnls: number[] = [];

  for (const h of data ?? []) {
    totalXaut = totalXaut.plus(h.xaut_amount ?? 0);
    totalInvested = totalInvested.plus(h.total_invested_inr ?? 0);
    const pnl = h.unrealized_pnl_inr ?? 0;
    pnls.push(pnl);
    if (pnl > 0) inProfit++;
    else if (pnl < 0) inLoss++;
  }

  const tvl = totalXaut.times(price.gold_price_inr);
  const avgPnl = pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;

  return {
    totalXaut: totalXaut.toNumber(),
    totalXautGrams: totalXaut.times(GRAMS_PER_OUNCE).toNumber(),
    tvlINR: tvl.toNumber(),
    totalInvested: totalInvested.toNumber(),
    usersInProfit: inProfit,
    usersInLoss: inLoss,
    avgPnl,
  };
}

export async function fetchHoldingsDistribution(): Promise<HoldingBucket[]> {
  const { data, error } = await supabase.from('holdings').select('xaut_amount');
  if (error) throw new Error(error.message);

  const buckets = { '<1g': 0, '1-10g': 0, '10-50g': 0, '50-100g': 0, '100g+': 0 };
  for (const h of data ?? []) {
    const grams = new Decimal(h.xaut_amount ?? 0).times(GRAMS_PER_OUNCE).toNumber();
    if (grams < 1) buckets['<1g']++;
    else if (grams < 10) buckets['1-10g']++;
    else if (grams < 50) buckets['10-50g']++;
    else if (grams < 100) buckets['50-100g']++;
    else buckets['100g+']++;
  }

  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

export async function fetchTopHolders(limit: number = 50): Promise<TopHolder[]> {
  const { data: holdings, error: hErr } = await supabase
    .from('holdings')
    .select('user_id, xaut_amount, total_invested_inr, unrealized_pnl_inr')
    .order('xaut_amount', { ascending: false })
    .limit(limit);

  if (hErr) throw new Error(hErr.message);

  const userIds = (holdings ?? []).map((h) => h.user_id);
  const { data: gamification } = await supabase
    .from('user_gamification')
    .select('user_id, saver_level')
    .in('user_id', userIds);

  const levelMap = new Map<string, number>();
  for (const g of gamification ?? []) {
    levelMap.set(g.user_id, g.saver_level);
  }

  return (holdings ?? []).map((h) => ({
    userId: h.user_id,
    xautAmount: h.xaut_amount,
    grams: new Decimal(h.xaut_amount ?? 0).times(GRAMS_PER_OUNCE).toNumber(),
    totalInvested: h.total_invested_inr ?? 0,
    pnl: h.unrealized_pnl_inr ?? 0,
    saverLevel: levelMap.get(h.user_id) ?? 0,
  }));
}

/** TVL trend over time — approximate from completed buy/sell transactions */
export interface TvlDataPoint {
  date: string;
  tvlINR: number;
}

export async function fetchTvlTrend(): Promise<TvlDataPoint[]> {
  // Use cumulative transaction volume as TVL proxy
  const { data: txs, error: txErr } = await supabase
    .from('transactions')
    .select('created_at, type, inr_amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (txErr) throw new Error(txErr.message);

  const dailyNet = new Map<string, number>();
  for (const tx of txs ?? []) {
    const day = tx.created_at.slice(0, 10);
    const current = dailyNet.get(day) ?? 0;
    const amount = tx.inr_amount ?? 0;
    // Buy adds to TVL, sell subtracts
    dailyNet.set(day, current + (tx.type === 'buy' ? amount : -amount));
  }

  let cumulative = 0;
  return Array.from(dailyNet.entries()).map(([date, net]) => {
    cumulative += net;
    return { date, tvlINR: Math.max(0, cumulative) };
  });
}
