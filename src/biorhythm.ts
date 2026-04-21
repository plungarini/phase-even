// biorhythm.ts — Pure math for the three classic biorhythm cycles.
// Values sit in [-1, +1]; derivative sign gives the trend arrow.

export const CYCLES = {
  physical: 23,
  emotional: 28,
  intellectual: 33,
} as const;

export type CycleKey = keyof typeof CYCLES;

const MS_PER_DAY = 86_400_000;

/** Whole days between two calendar dates (ignoring DST edge cases). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((b - a) / MS_PER_DAY);
}

/** Biorhythm value at `day` for the given cycle period. Range [-1, +1]. */
export function cycleValue(day: number, period: number): number {
  return Math.sin((2 * Math.PI * day) / period);
}

/** Derivative (trend) at `day`. Same shape, shifted by π/2. */
export function cycleTrend(day: number, period: number): number {
  return Math.cos((2 * Math.PI * day) / period);
}

export function trendArrow(day: number, period: number): '↑' | '↓' | '→' {
  const t = cycleTrend(day, period);
  if (t > 0.15) return '↑';
  if (t < -0.15) return '↓';
  return '→';
}

/** Block glyphs from empty → full. 9 levels map sin [-1,+1] → column. */
const BLOCKS = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

function blockFor(v: number): string {
  const idx = Math.round(((v + 1) / 2) * (BLOCKS.length - 1));
  return BLOCKS[Math.max(0, Math.min(BLOCKS.length - 1, idx))];
}

/**
 * Render a waveform strip of `width` chars centered on `day`.
 * Each column is one day; the middle column is "today".
 */
export function renderWaveform(day: number, period: number, width: number): string {
  const half = Math.floor(width / 2);
  let s = '';
  for (let i = 0; i < width; i++) {
    const d = day - half + i;
    s += blockFor(cycleValue(d, period));
  }
  return s;
}

export interface CycleSnapshot {
  key: CycleKey;
  period: number;
  day: number;            // day within cycle (0..period-1)
  value: number;          // sin value today
  arrow: '↑' | '↓' | '→';
  waveform: string;
}

export function computeAll(birthDate: Date, today: Date, width = 13): CycleSnapshot[] {
  const d = daysBetween(birthDate, today);
  return (Object.keys(CYCLES) as CycleKey[]).map((key) => {
    const period = CYCLES[key];
    return {
      key,
      period,
      day: ((d % period) + period) % period,
      value: cycleValue(d, period),
      arrow: trendArrow(d, period),
      waveform: renderWaveform(d, period, width),
    };
  });
}
