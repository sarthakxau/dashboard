import { supabase } from '@/lib/supabase';
import { presetToFrom } from '@/lib/dateRange';
import type { DateRangePreset, DbTransaction } from '@/types';

export interface TransactionMetrics {
  buyCount: number;
  sellCount: number;
  buyVolumeINR: number;
  sellVolumeINR: number;
  avgOrderSize: number;
  successRate: number;
  failedCount: number;
}

export interface DailyVolume {
  date: string;
  buy: number;
  sell: number;
}

export interface HourlyCount {
  hour: number;
  count: number;
}

export async function fetchTransactionMetrics(preset: DateRangePreset): Promise<TransactionMetrics> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('type, status, inr_amount');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let buyCount = 0, sellCount = 0, buyVol = 0, sellVol = 0, completedCount = 0, failedCount = 0, totalCount = 0;
  for (const tx of data ?? []) {
    totalCount++;
    if (tx.status === 'completed') {
      completedCount++;
      if (tx.type === 'buy') { buyCount++; buyVol += tx.inr_amount ?? 0; }
      else { sellCount++; sellVol += tx.inr_amount ?? 0; }
    }
    if (tx.status === 'failed') failedCount++;
  }

  return {
    buyCount,
    sellCount,
    buyVolumeINR: buyVol,
    sellVolumeINR: sellVol,
    avgOrderSize: completedCount > 0 ? (buyVol + sellVol) / completedCount : 0,
    successRate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    failedCount,
  };
}

export async function fetchRecentTransactions(
  preset: DateRangePreset,
  filters?: { type?: 'buy' | 'sell'; status?: string },
): Promise<DbTransaction[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(500);
  if (from) query = query.gte('created_at', from);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchVolumeTimeSeries(preset: DateRangePreset): Promise<DailyVolume[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('created_at, type, inr_amount').eq('status', 'completed').order('created_at', { ascending: true });
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const map = new Map<string, { buy: number; sell: number }>();
  for (const tx of data ?? []) {
    const day = tx.created_at.slice(0, 10);
    const entry = map.get(day) ?? { buy: 0, sell: 0 };
    if (tx.type === 'buy') entry.buy += tx.inr_amount ?? 0;
    else entry.sell += tx.inr_amount ?? 0;
    map.set(day, entry);
  }

  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
}

export async function fetchHourlyDistribution(preset: DateRangePreset): Promise<HourlyCount[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('created_at').eq('status', 'completed');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const hours = new Array(24).fill(0);
  for (const tx of data ?? []) {
    // Convert to IST before extracting hour (UTC+5:30)
    const utc = new Date(tx.created_at);
    const istHour = (utc.getUTCHours() + 5 + (utc.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;
    hours[istHour]++;
  }

  return hours.map((count, hour) => ({ hour, count }));
}

/** Buy/sell ratio over time — for line chart */
export interface DailyRatio {
  date: string;
  ratio: number;
}

export async function fetchBuySellRatio(preset: DateRangePreset): Promise<DailyRatio[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('created_at, type').eq('status', 'completed').order('created_at', { ascending: true });
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const map = new Map<string, { buy: number; sell: number }>();
  for (const tx of data ?? []) {
    const day = tx.created_at.slice(0, 10);
    const entry = map.get(day) ?? { buy: 0, sell: 0 };
    if (tx.type === 'buy') entry.buy++;
    else entry.sell++;
    map.set(day, entry);
  }

  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    ratio: v.sell > 0 ? v.buy / v.sell : v.buy,
  }));
}

/** Order size distribution — for histogram */
export interface OrderSizeBucket {
  range: string;
  count: number;
}

export async function fetchOrderSizeDistribution(preset: DateRangePreset): Promise<OrderSizeBucket[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('transactions').select('inr_amount').eq('status', 'completed');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const buckets = { '<500': 0, '500-1k': 0, '1k-5k': 0, '5k-10k': 0, '10k-50k': 0, '50k+': 0 };
  for (const tx of data ?? []) {
    const amt = tx.inr_amount ?? 0;
    if (amt < 500) buckets['<500']++;
    else if (amt < 1000) buckets['500-1k']++;
    else if (amt < 5000) buckets['1k-5k']++;
    else if (amt < 10000) buckets['5k-10k']++;
    else if (amt < 50000) buckets['10k-50k']++;
    else buckets['50k+']++;
  }

  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}
