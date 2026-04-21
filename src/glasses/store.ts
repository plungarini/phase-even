// store.ts — Tiny pub/sub shared between the webview and the glasses entry.
// Plain JS, no React — both layers read the same source of truth.

import { computeAll, type CycleSnapshot } from '../biorhythm';

const WAVEFORM_WIDTH = 18;

export interface PhaseState {
  birthDate: string | null;  // ISO YYYY-MM-DD
  today: string;              // ISO YYYY-MM-DD
  cycles: CycleSnapshot[];
}

function todayISO(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseISO(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function recompute(birthDate: string | null, today: string): CycleSnapshot[] {
  const bd = birthDate ? parseISO(birthDate) : null;
  const td = parseISO(today) ?? new Date();
  return bd ? computeAll(bd, td, WAVEFORM_WIDTH) : [];
}

type Listener = (state: PhaseState) => void;

class Store {
  private _state: PhaseState;
  private listeners = new Set<Listener>();

  constructor() {
    const today = todayISO();
    this._state = { birthDate: null, today, cycles: [] };
  }

  get state(): PhaseState {
    return this._state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this._state);
  }

  setBirthDate(iso: string | null): void {
    if (this._state.birthDate === iso) return;
    this._state = {
      ...this._state,
      birthDate: iso,
      cycles: recompute(iso, this._state.today),
    };
    this.emit();
  }

  setToday(iso: string): void {
    if (this._state.today === iso) return;
    this._state = {
      ...this._state,
      today: iso,
      cycles: recompute(this._state.birthDate, iso),
    };
    this.emit();
  }
}

export const store = new Store();
