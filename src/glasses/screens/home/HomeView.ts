// HomeView.ts — Pure display function for the Phase HUD.

import { glassHeader, line, type DisplayData } from 'even-toolkit/types';
import type { CycleSnapshot } from '../../../biorhythm';

export interface HomeViewData {
  cycles: CycleSnapshot[];
  today: string;        // ISO date
  hasBirthDate: boolean;
}

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${SHORT_MONTH[m - 1]} ${d}`;
}

function row(label: string, c: CycleSnapshot): string {
  // Fixed-width label so waveforms align across rows.
  const pad = label.padEnd(9, ' ');
  return `${pad}${c.waveform} ${c.arrow}`;
}

export function renderHomeView(data: HomeViewData): DisplayData {
  if (!data.hasBirthDate) {
    return {
      lines: [
        ...glassHeader('PHASE'),
        line('Open the app on', 'meta'),
        line('your phone to', 'meta'),
        line('set your birth', 'meta'),
        line('date.', 'meta'),
      ],
    };
  }

  const [phys, emo, intel] = data.cycles;
  return {
    lines: [
      ...glassHeader('PHASE'),
      line(row('Physical', phys)),
      line(row('Emotional', emo)),
      line(row('Intellect', intel)),
      line(''),
      line(
        `${formatDate(data.today)} · P${phys.day}/${phys.period} E${emo.day}/${emo.period} I${intel.day}/${intel.period}`,
        'meta',
      ),
    ],
  };
}
