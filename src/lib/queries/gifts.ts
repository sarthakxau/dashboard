import { supabase } from '@/lib/supabase';
import { presetToFrom } from '@/lib/dateRange';
import type { DateRangePreset } from '@/types';

export interface GiftMetrics {
  totalSent: number;
  totalClaimed: number;
  claimRate: number;
  totalXautGifted: number;
  avgGiftSizeINR: number;
  expiredCount: number;
}

export interface GiftFunnelStep {
  stage: string;
  count: number;
}

export interface OccasionCount {
  occasion: string;
  count: number;
}

export interface RecentGift {
  id: string;
  senderEmail: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  grams: number;
  inrAmount: number;
  occasion: string;
  status: string;
  createdAt: string;
  claimedAt: string | null;
  timeToClaimHours: number | null;
}

export async function fetchGiftMetrics(preset: DateRangePreset): Promise<GiftMetrics> {
  const from = presetToFrom(preset);
  let query = supabase.from('gifts').select('status, xaut_amount, inr_amount');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let totalSent = 0, totalClaimed = 0, expiredCount = 0, totalXaut = 0, totalINR = 0;
  for (const g of data ?? []) {
    totalSent++;
    totalXaut += g.xaut_amount;
    totalINR += g.inr_amount;
    if (g.status === 'claimed') totalClaimed++;
    if (g.status === 'expired') expiredCount++;
  }

  return {
    totalSent,
    totalClaimed,
    claimRate: totalSent > 0 ? (totalClaimed / totalSent) * 100 : 0,
    totalXautGifted: totalXaut,
    avgGiftSizeINR: totalSent > 0 ? totalINR / totalSent : 0,
    expiredCount,
  };
}

export async function fetchGiftFunnel(preset: DateRangePreset): Promise<GiftFunnelStep[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('gifts').select('status');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = { pending: 0, delivered: 0, claimed: 0, expired: 0 };
  for (const g of data ?? []) {
    const s = g.status as keyof typeof counts;
    if (s in counts) counts[s]++;
  }

  return [
    { stage: 'Pending', count: counts.pending },
    { stage: 'Delivered', count: counts.delivered },
    { stage: 'Claimed', count: counts.claimed },
    { stage: 'Expired', count: counts.expired },
  ];
}

export async function fetchGiftsByOccasion(preset: DateRangePreset): Promise<OccasionCount[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('gifts').select('occasion');
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const g of data ?? []) {
    counts.set(g.occasion, (counts.get(g.occasion) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([occasion, count]) => ({ occasion, count }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchRecentGifts(preset: DateRangePreset): Promise<RecentGift[]> {
  const from = presetToFrom(preset);
  let query = supabase
    .from('gifts')
    .select('id, sender_user_id, recipient_name, recipient_email, grams_amount, inr_amount, occasion, status, created_at, claimed_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (from) query = query.gte('created_at', from);

  const { data: gifts, error } = await query;
  if (error) throw new Error(error.message);

  // Fetch sender emails via JOIN
  const senderIds = [...new Set((gifts ?? []).map((g) => g.sender_user_id))];
  const { data: senders } = await supabase
    .from('users')
    .select('id, email, phone')
    .in('id', senderIds);

  const senderMap = new Map<string, string>();
  for (const s of senders ?? []) {
    senderMap.set(s.id, s.email ?? s.phone ?? '—');
  }

  return (gifts ?? []).map((g) => {
    // Compute time-to-claim in hours (null if not claimed)
    let timeToClaimHours: number | null = null;
    if (g.claimed_at && g.created_at) {
      timeToClaimHours = Math.round((new Date(g.claimed_at).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60));
    }

    return {
      id: g.id,
      senderEmail: senderMap.get(g.sender_user_id) ?? '—',
      recipientName: g.recipient_name,
      recipientEmail: g.recipient_email,
      grams: g.grams_amount,
      inrAmount: g.inr_amount,
      occasion: g.occasion,
      status: g.status,
      createdAt: g.created_at,
      claimedAt: g.claimed_at,
      timeToClaimHours,
    };
  });
}

/** Daily gifts sent — for line chart */
export interface DailyGiftCount {
  date: string;
  count: number;
}

export async function fetchDailyGiftsSent(preset: DateRangePreset): Promise<DailyGiftCount[]> {
  const from = presetToFrom(preset);
  let query = supabase.from('gifts').select('created_at').order('created_at', { ascending: true });
  if (from) query = query.gte('created_at', from);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const g of data ?? []) {
    const day = g.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
