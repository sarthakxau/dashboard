import { supabase } from '@/lib/supabase';
import { subDays, subMinutes } from 'date-fns';
import type { DbTransaction } from '@/types';

export interface PriceOracleStatus {
  lastUpdate: string | null;
  currentPriceUSD: number | null;
  currentPriceINR: number | null;
  usdInrRate: number | null;
  price24hHighUSD: number | null;
  price24hLowUSD: number | null;
  priceGaps7d: number; // count of 10+ minute gaps in last 7 days
}

export interface FailedTxSummary {
  count24h: number;
  count7d: number;
  recentFailed: DbTransaction[];
  errorGroups: { error: string; count: number }[];
}

export interface StaleData {
  stalePendingTxs: number;
  giftsExpiringIn48h: number;
}

export interface DbTableStat {
  table: string;
  count: number;
}

export async function fetchPriceOracleStatus(): Promise<PriceOracleStatus> {
  const dayAgo = subDays(new Date(), 1).toISOString();
  const weekAgo = subDays(new Date(), 7).toISOString();

  const [latestRes, range24hRes, historyRes] = await Promise.all([
    supabase.from('price_history').select('gold_price_usd, gold_price_inr, usd_inr_rate, timestamp').order('timestamp', { ascending: false }).limit(1),
    supabase.from('price_history').select('gold_price_usd').gte('timestamp', dayAgo),
    supabase.from('price_history').select('timestamp').gte('timestamp', weekAgo).order('timestamp', { ascending: true }),
  ]);

  const latest = latestRes.data?.[0] ?? null;

  // Compute 24h price range
  const prices24h = (range24hRes.data ?? []).map((p) => p.gold_price_usd);
  const price24hHighUSD = prices24h.length > 0 ? Math.max(...prices24h) : null;
  const price24hLowUSD = prices24h.length > 0 ? Math.min(...prices24h) : null;

  // Count gaps > 10 minutes in last 7 days
  let gapCount = 0;
  const timestamps = (historyRes.data ?? []).map((p) => new Date(p.timestamp).getTime());
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i]! - timestamps[i - 1]! > 10 * 60 * 1000) gapCount++;
  }

  return {
    lastUpdate: latest?.timestamp ?? null,
    currentPriceUSD: latest?.gold_price_usd ?? null,
    currentPriceINR: latest?.gold_price_inr ?? null,
    usdInrRate: latest?.usd_inr_rate ?? null,
    price24hHighUSD,
    price24hLowUSD,
    priceGaps7d: gapCount,
  };
}

export async function fetchFailedTxSummary(): Promise<FailedTxSummary> {
  const dayAgo = subDays(new Date(), 1).toISOString();
  const weekAgo = subDays(new Date(), 7).toISOString();

  const [day, week, recent] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', dayAgo),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', weekAgo),
    supabase.from('transactions').select('*').eq('status', 'failed').order('created_at', { ascending: false }).limit(50),
  ]);

  // Group by error message
  const errorMap = new Map<string, number>();
  for (const tx of recent.data ?? []) {
    const msg = tx.error_message ?? 'Unknown error';
    errorMap.set(msg, (errorMap.get(msg) ?? 0) + 1);
  }

  const errorGroups = Array.from(errorMap.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count);

  return {
    count24h: day.count ?? 0,
    count7d: week.count ?? 0,
    recentFailed: recent.data ?? [],
    errorGroups,
  };
}

export async function fetchStaleData(): Promise<StaleData> {
  const tenMinAgo = subMinutes(new Date(), 10).toISOString();
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const [staleTxs, expiringGifts] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending').lte('created_at', tenMinAgo),
    supabase.from('gifts').select('id', { count: 'exact', head: true }).in('status', ['pending', 'delivered']).lte('expires_at', twoDaysFromNow).gte('expires_at', new Date().toISOString()),
  ]);

  return {
    stalePendingTxs: staleTxs.count ?? 0,
    giftsExpiringIn48h: expiringGifts.count ?? 0,
  };
}

export async function fetchDbStats(): Promise<DbTableStat[]> {
  const tables = ['users', 'transactions', 'holdings', 'gifts', 'user_gamification', 'user_badges', 'price_history'];

  const results = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
      return { table, count: count ?? 0 };
    }),
  );

  return results;
}
