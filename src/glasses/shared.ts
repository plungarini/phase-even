// shared.ts — Global snapshot for the Phase app.

import type { CycleSnapshot } from '../biorhythm';

export interface AppSnapshot {
  /** ISO date string (YYYY-MM-DD), or null if user hasn't set birth date. */
  birthDate: string | null;
  /** Today's date as ISO (YYYY-MM-DD). */
  today: string;
  /** Pre-computed cycles (empty if birthDate is null). */
  cycles: CycleSnapshot[];
}
