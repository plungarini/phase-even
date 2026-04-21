import { useEffect, useMemo, useState } from 'react';
import { AppShell, NavBar, ScreenHeader, Card } from 'even-toolkit/web';
import type { NavItem } from 'even-toolkit/web';
import { AppGlasses } from './glasses/AppGlasses';
import type { AppSnapshot } from './glasses/shared';
import { computeAll } from './biorhythm';

const tabs: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'settings', label: 'Settings' },
];

const STORAGE_KEY = 'phase:birthDate';

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseISO(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function pctLabel(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [birthDate, setBirthDate] = useState<string | null>(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  );
  const [today, setToday] = useState(todayISO());

  // Re-compute today daily (in case the app stays open past midnight).
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000);
    return () => clearInterval(id);
  }, []);

  const snapshot: AppSnapshot = useMemo(() => {
    const bd = birthDate ? parseISO(birthDate) : null;
    const td = parseISO(today) ?? new Date();
    return {
      birthDate,
      today,
      cycles: bd ? computeAll(bd, td) : [],
    };
  }, [birthDate, today]);

  const handleBirthChange = (v: string) => {
    if (!v) return;
    localStorage.setItem(STORAGE_KEY, v);
    setBirthDate(v);
  };

  const clearBirth = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBirthDate(null);
  };

  return (
    <>
      <AppGlasses snapshot={snapshot} />
      <AppShell header={<NavBar items={tabs} activeId={tab} onNavigate={setTab} />}>
        <div className="px-3 pt-4 pb-8 space-y-3">
          <ScreenHeader title="Phase" subtitle="Biorhythm engine (pseudoscience, beautifully)" />

          {tab === 'home' && (
            <>
              {!birthDate && (
                <Card>
                  <p className="text-[15px] text-text-dim">
                    Set your birth date in Settings to see your cycles.
                  </p>
                </Card>
              )}
              {birthDate && snapshot.cycles.length === 3 && (
                <Card>
                  <div className="space-y-2 font-mono text-[13px] leading-relaxed">
                    {snapshot.cycles.map((c) => (
                      <div key={c.key} className="flex items-center justify-between gap-2">
                        <span className="capitalize w-24">{c.key}</span>
                        <span className="flex-1 truncate">{c.waveform}</span>
                        <span className="w-10 text-right">{pctLabel(c.value)}</span>
                        <span className="w-4 text-right">{c.arrow}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-text-dim">
                      {today} · Day{' '}
                      {snapshot.cycles.map((c, i) => (
                        <span key={c.key}>
                          {i > 0 ? ' · ' : ''}
                          {c.key[0].toUpperCase()}
                          {c.day}/{c.period}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
              <Card>
                <p className="text-[13px] text-text-dim">
                  Three sinusoidal cycles keyed to your birth date: Physical (23d),
                  Emotional (28d), Intellectual (33d). This is pseudoscience. It's an
                  aesthetic object, not a health tool.
                </p>
              </Card>
            </>
          )}

          {tab === 'settings' && (
            <Card>
              <label className="block text-[13px] text-text-dim mb-2">Birth date</label>
              <input
                type="date"
                value={birthDate ?? ''}
                max={today}
                onChange={(e) => handleBirthChange(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-[15px]"
              />
              {birthDate && (
                <button
                  onClick={clearBirth}
                  className="mt-3 text-[13px] text-text-dim underline"
                >
                  Clear
                </button>
              )}
            </Card>
          )}
        </div>
      </AppShell>
    </>
  );
}
