import { supabase } from '@/lib/supabase';
import type { LatestPrice } from '@/types';

export async function fetchLatestPrice(): Promise<LatestPrice | null> {
  const { data, error } = await supabase
    .from('price_history')
    .select('gold_price_usd, gold_price_inr, usd_inr_rate, timestamp')
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch latest price: ${error.message}`);
  return data;
}
