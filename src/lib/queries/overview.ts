import { supabase } from '@/lib/supabase';
import { subDays } from 'date-fns';
import Decimal from 'decimal.js';

export interface OverviewMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalXaut: number;
  totalINRTransacted: number;
  activeStreaks: number;
  failedTxs24h: number;
  pendingGiftsExpiring: number;
  lastPriceUpdate: string | null;
}

export interface DailyDataPoint {
  date: string;
  value: number;
}

export async function fetchOverviewMetrics(): Promise<OverviewMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = subDays(now, 7).toISOString();
  const dayAgo = subDays(now, 1).toISOString();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const [usersRes, newTodayRes, newWeekRes, holdingsRes, txVolumeRes, streaksRes, failedRes, expiringGiftsRes, lastPriceRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('holdings').select('xaut_amount'),
    supabase.from('transactions').select('inr_amount').eq('status', 'completed'),
    supabase.from('user_gamification').select('id', { count: 'exact', head: true }).gt('streak_current', 0),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', dayAgo),
    supabase.from('gifts').select('id', { count: 'exact', head: true }).in('status', ['pending', 'delivered']).lte('expires_at', twoDaysFromNow),
    supabase.from('price_history').select('timestamp').order('timestamp', { ascending: false }).limit(1),
  ]);

  const totalXaut = (holdingsRes.data ?? []).reduce((sum, h) => sum.plus(h.xaut_amount ?? 0), new Decimal(0)).toNumber();
  const totalINR = (txVolumeRes.data ?? []).reduce((sum, t) => sum.plus(t.inr_amount ?? 0), new Decimal(0)).toNumber();

  return {
    totalUsers: usersRes.count ?? 0,
    newUsersToday: newTodayRes.count ?? 0,
    newUsersWeek: newWeekRes.count ?? 0,
    totalXaut,
    totalINRTransacted: totalINR,
    activeStreaks: streaksRes.count ?? 0,
    failedTxs24h: failedRes.count ?? 0,
    pendingGiftsExpiring: expiringGiftsRes.count ?? 0,
    lastPriceUpdate: lastPriceRes.data?.[0]?.timestamp ?? null,
  };
}

export async function fetchDailyNewUsers(days: number = 30): Promise<DailyDataPoint[]> {
  const from = subDays(new Date(), days).toISOString();
  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', from)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const user of data ?? []) {
    const day = user.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, value]) => ({ date, value }));
}

export async function fetchDailyTxVolume(days: number = 30): Promise<DailyDataPoint[]> {
  const from = subDays(new Date(), days).toISOString();
  const { data, error } = await supabase
    .from('transactions')
    .select('created_at, inr_amount')
    .eq('status', 'completed')
    .gte('created_at', from)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const sums = new Map<string, number>();
  for (const tx of data ?? []) {
    const day = tx.created_at.slice(0, 10);
    sums.set(day, (sums.get(day) ?? 0) + (tx.inr_amount ?? 0));
  }

  return Array.from(sums.entries()).map(([date, value]) => ({ date, value }));
}
