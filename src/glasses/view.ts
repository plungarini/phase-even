// view.ts — Format PhaseState into the 3 container contents.
// Header: time · app name.  Body: title + 3 centered cycle rows + date line.

import { BODY_INNER_PX, CONTAINER, HEADER_INNER_PX } from './layout';
import type { PhaseState } from './store';
import { alignRow, centerLine } from './text-utils';

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatClockTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${SHORT_MONTH[m - 1]} ${d}, ${y}`;
}

function pct(v: number): string {
  const s = v >= 0 ? '+' : '';
  return `${s}${Math.round(v * 100)}%`;
}

function cycleRow(label: string, arrow: string, percent: string, day: number, period: number): string {
  // The body is proportional-font text; we use pretext-measured alignRow on
  // a single-column layout. Columns separated by triple spaces render as a
  // visible gap on the G2 font.
  return `${label}   ${arrow}   ${percent}   day ${day}/${period}`;
}

export function renderContents(state: PhaseState): Record<string, string> {
  const clock = formatClockTime(new Date());
  const header = alignRow(clock, 'phase', HEADER_INNER_PX);

  if (!state.birthDate || state.cycles.length !== 3) {
    const body = [
      '',
      centerLine('Set your birth date', BODY_INNER_PX),
      centerLine('in the Phase app on your phone', BODY_INNER_PX),
      '',
      '',
      centerLine(formatDate(state.today), BODY_INNER_PX),
    ].join('\n');
    return { [CONTAINER.shield]: ' ', [CONTAINER.header]: header, [CONTAINER.body]: body };
  }

  const [phys, emo, intel] = state.cycles;
  const body = [
    '',
    centerLine(cycleRow('Physical ', phys.arrow, pct(phys.value), phys.day, phys.period), BODY_INNER_PX),
    '',
    centerLine(cycleRow('Emotional', emo.arrow, pct(emo.value), emo.day, emo.period), BODY_INNER_PX),
    '',
    centerLine(cycleRow('Intellect', intel.arrow, pct(intel.value), intel.day, intel.period), BODY_INNER_PX),
    '',
    centerLine(formatDate(state.today), BODY_INNER_PX),
  ].join('\n');

  return { [CONTAINER.shield]: ' ', [CONTAINER.header]: header, [CONTAINER.body]: body };
}
