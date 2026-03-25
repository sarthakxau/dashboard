import { supabase } from '@/lib/supabase';
import { presetToFrom } from '@/lib/dateRange';
import type { DateRangePreset, DbUser } from '@/types';

export interface UserMetrics {
  total: number;
  newDay: number;
  newWeek: number;
  newMonth: number;
  kycPending: number;
  kycVerified: number;
  kycRejected: number;
  withWallet: number;
}

export interface UserSegments {
  neverTransacted: number;
  oneBuy: number;
  repeatBuyers: number;
  powerUsers: number;
}

export interface DailySignups {
  date: string;
  count: number;
}

export async function fetchUserMetrics(): Promise<UserMetrics> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [total, newDay, newWeek, newMonth, allUsers] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo),
    supabase.from('users').select('kyc_status, wallet_address'),
  ]);

  const users = allUsers.data ?? [];
  let kycPending = 0, kycVerified = 0, kycRejected = 0, withWallet = 0;
  for (const u of users) {
    if (u.kyc_status === 'pending') kycPending++;
    else if (u.kyc_status === 'verified') kycVerified++;
    else if (u.kyc_status === 'rejected') kycRejected++;
    if (u.wallet_address && u.wallet_address !== '0x0000000000000000000000000000000000000000') withWallet++;
  }

  return {
    total: total.count ?? 0,
    newDay: newDay.count ?? 0,
    newWeek: newWeek.count ?? 0,
    newMonth: newMonth.count ?? 0,
    kycPending,
    kycVerified,
    kycRejected,
    withWallet,
  };
}

export async function fetchRecentSignups(limit: number = 100): Promise<DbUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchUserSegments(): Promise<UserSegments> {
  // Get all user IDs
  const { data: allUsers } = await supabase.from('users').select('id');
  const userIds = new Set((allUsers ?? []).map((u) => u.id));

  // Get transaction counts per user
  const { data: txData } = await supabase
    .from('transactions')
    .select('user_id, type')
    .eq('status', 'completed')
    .eq('type', 'buy');

  const buyCounts = new Map<string, number>();
  for (const tx of txData ?? []) {
    buyCounts.set(tx.user_id, (buyCounts.get(tx.user_id) ?? 0) + 1);
  }

  let neverTransacted = 0, oneBuy = 0, repeatBuyers = 0, powerUsers = 0;
  for (const userId of userIds) {
    const count = buyCounts.get(userId) ?? 0;
    if (count === 0) neverTransacted++;
    else if (count === 1) oneBuy++;
    else if (count < 10) repeatBuyers++;
    else powerUsers++;
  }

  return { neverTransacted, oneBuy, repeatBuyers, powerUsers };
}

export async function fetchSignupTimeSeries(preset: DateRangePreset): Promise<DailySignups[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('users').select('created_at').order('created_at', { ascending: true });
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const u of data ?? []) {
    const day = u.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  // Cumulative
  let cumulative = 0;
  return Array.from(counts.entries()).map(([date, count]) => {
    cumulative += count;
    return { date, count: cumulative };
  });
}

/** Non-cumulative daily new signups — for bar chart */
export async function fetchDailySignups(preset: DateRangePreset): Promise<DailySignups[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('users').select('created_at').order('created_at', { ascending: true });
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const u of data ?? []) {
    const day = u.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
