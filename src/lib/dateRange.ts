import { startOfDay, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { DateRangePreset } from '@/types';

const IST = 'Asia/Kolkata';

export function presetToFrom(preset: DateRangePreset): string | null {
  if (preset === 'all') return null;

  const nowIST = toZonedTime(new Date(), IST);
  let from: Date;

  switch (preset) {
    case 'today':
      from = startOfDay(nowIST);
      break;
    case '7d':
      from = startOfDay(subDays(nowIST, 7));
      break;
    case '30d':
      from = startOfDay(subDays(nowIST, 30));
      break;
    case '90d':
      from = startOfDay(subDays(nowIST, 90));
      break;
  }

  return from.toISOString();
}
