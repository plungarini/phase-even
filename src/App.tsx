import { useEffect, useState, useSyncExternalStore } from 'react';

import type { CycleSnapshot } from './biorhythm';
import { BottomTabBar, type PhaseTab } from './components/BottomTabBar';
import { CycleSparkline } from './components/CycleSparkline';
import { PageHeader } from './components/PageHeader';
import { store } from './glasses/store';

const LOCAL_KEY = 'phase:birthDate';

function subscribe(fn: () => void) {
  return store.subscribe(fn);
}
function getSnapshot() {
  return store.state;
}

function pctLabel(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${Math.round(v * 100)}%`;
}

function arrowBadgeClass(arrow: string): string {
  if (arrow === '↓') return 'phase-arrow-badge is-down';
  if (arrow === '→') return 'phase-arrow-badge is-flat';
  return 'phase-arrow-badge';
}

function trendLabel(arrow: string): string {
  if (arrow === '↓') return 'falling';
  if (arrow === '→') return 'steady';
  return 'rising';
}

function pctClass(v: number): string {
  if (v > 0.02) return 'phase-pct phase-pct-up';
  if (v < -0.02) return 'phase-pct phase-pct-down';
  return 'phase-pct';
}

function CycleCard({ cycle }: { cycle: CycleSnapshot }) {
  return (
    <div className="phase-cycle-card">
      <div className="phase-cycle-top">
        <div className="min-w-0">
          <div className="phase-cycle-kind">{cycle.key}</div>
          <div className="phase-cycle-meta">
            day {cycle.day} / {cycle.period}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={pctClass(cycle.value)}>{pctLabel(cycle.value)}</div>
          <div className="phase-trend-row">
            <span className={arrowBadgeClass(cycle.arrow)} aria-hidden>
              {cycle.arrow}
            </span>
            <span className="phase-trend-label">{trendLabel(cycle.arrow)}</span>
          </div>
        </div>
      </div>
      <CycleSparkline cycle={cycle} />
    </div>
  );
}

function HomeTab({
  state,
  onGoToSettings,
}: {
  state: ReturnType<typeof getSnapshot>;
  onGoToSettings: () => void;
}) {
  if (!state.birthDate || state.cycles.length !== 3) {
    return (
      <div className="phase-fade-in flex h-full flex-col">
        <PageHeader
          eyebrow="Phase"
          title={
            <>
              Three cycles,
              <br />
              <em>one day.</em>
            </>
          }
        />
        <div className="flex-1 px-5 pb-40">
          <div className="phase-glass-card phase-empty">
            <div className="phase-empty-orb" aria-hidden />
            <div className="phase-eyebrow">No birth date</div>
            <p className="phase-disclaimer max-w-xs">
              Phase needs your birth date to compute the physical, emotional, and
              intellectual cycles. Stored on-device.
            </p>
            <button type="button" className="phase-cta mt-2" onClick={onGoToSettings}>
              Set birth date
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avg =
    state.cycles.reduce((acc, c) => acc + c.value, 0) / state.cycles.length;

  return (
    <div className="phase-fade-in flex h-full flex-col">
      <PageHeader
        eyebrow={state.today}
        title={
          <>
            Today you are
            <br />
            <em>in phase.</em>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        <div className="phase-glass-card p-6">
          <div className="phase-section-label">Composite</div>
          <div className="phase-big-stat mt-2">
            {pctLabel(avg)}
            <em>.</em>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {state.cycles.map((c) => (
              <CycleCard key={c.key} cycle={c} />
            ))}
          </div>
        </div>

        <div className="phase-glass-card mt-4 p-5">
          <p className="phase-disclaimer">
            Biorhythm theory is <em>pseudoscience</em> with no empirical support.
            Phase renders it honestly: an aesthetic object, not a health tool.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  birthDate,
  today,
  onChange,
  onClear,
}: {
  birthDate: string | null;
  today: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="phase-fade-in flex h-full flex-col">
      <PageHeader
        eyebrow="Settings"
        title={
          <>
            Your
            <br />
            <em>birth date.</em>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-40">
        <div className="phase-glass-card p-5">
          <div className="phase-section-label mb-3">Birthday</div>
          <input
            type="date"
            className="phase-date-input"
            value={birthDate ?? ''}
            max={today}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
          />
          {birthDate ? (
            <div className="mt-4 flex items-center justify-between">
              <span className="phase-date-pill">{birthDate}</span>
              <button type="button" className="phase-cta is-ghost" onClick={onClear}>
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="phase-glass-card mt-4 p-5">
          <p className="phase-disclaimer">
            Stored locally in your browser and, on the glasses, in the Even Hub
            app's sandboxed storage. <em>Never sent to a server.</em>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [tab, setTab] = useState<PhaseTab>('home');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved && saved !== store.state.birthDate) store.setBirthDate(saved);
  }, []);

  useEffect(() => {
    return store.subscribe((s) => {
      if (s.birthDate) localStorage.setItem(LOCAL_KEY, s.birthDate);
      else localStorage.removeItem(LOCAL_KEY);
    });
  }, []);

  return (
    <div className="phase-app-shell relative h-dvh overflow-hidden">
      <div className="phase-ornament phase-ornament-top" aria-hidden />
      <div className="phase-ornament phase-ornament-bottom" aria-hidden />

      <div className="relative mx-auto flex h-full max-w-md flex-col">
        {tab === 'home' ? (
          <HomeTab state={state} onGoToSettings={() => setTab('settings')} />
        ) : (
          <SettingsTab
            birthDate={state.birthDate}
            today={state.today}
            onChange={(v) => store.setBirthDate(v)}
            onClear={() => store.setBirthDate(null)}
          />
        )}
        <BottomTabBar activeTab={tab} onChange={setTab} />
      </div>
    </div>
  );
}
