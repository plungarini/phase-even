// tick.ts — Drive periodic re-renders so the header clock advances
// and today's date rolls over at midnight.

import { store } from './store';

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Bumper re-emits the store every minute so header clock stays fresh. */
export function startTick(onMinute: () => void): void {
  setInterval(() => {
    const next = todayISO();
    if (next !== store.state.today) store.setToday(next);
    onMinute();
  }, 30_000);
}
