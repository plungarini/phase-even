// view.ts — Format PhaseState into HUD text and image containers.

import type { CycleSnapshot } from '../biorhythm';
import { renderCycleChartPng } from './chart-image';
import {
  BODY_INNER_PX,
  CHART_HEIGHT,
  CHART_LAYOUT,
  CHART_WIDTH,
  CONTAINER,
  EMPTY_LAYOUT,
  HEADER_INNER_PX,
  ROW_INNER_PX,
} from './layout';
import type { PhaseState } from './store';
import { alignRow, centerLine } from './text-utils';
import type { HudRenderState } from './types';

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatClockTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatHeaderDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${SHORT_MONTH[m - 1]} ${d}`;
}

function pct(v: number): string {
  const s = v >= 0 ? '+' : '';
  return `${s}${Math.round(v * 100)}%`;
}

function trendWord(arrow: string): string {
  if (arrow === '↓') return 'falling';
  if (arrow === '→') return 'steady';
  return 'rising';
}

function cycleSymbol(label: string): string {
  if (label === 'Physical') return '▲';
  if (label === 'Emotional') return '●';
  return '◆';
}

function rowText(label: string, cycle: CycleSnapshot): string {
  const labelWithSymbol = `${cycleSymbol(label)}  ${label}`;
  return [
    alignRow(labelWithSymbol, pct(cycle.value), ROW_INNER_PX),
    alignRow(trendWord(cycle.arrow), `day ${cycle.day}/${cycle.period}`, ROW_INNER_PX),
  ].join('\n');
}

export async function renderHudState(state: PhaseState): Promise<HudRenderState> {
  const clock = formatClockTime(new Date());
  const header = alignRow(`${clock}   •   ${formatHeaderDate(state.today)}`, 'phase', HEADER_INNER_PX);

  if (!state.birthDate || state.cycles.length !== 3) {
    const body = [
      '',
      centerLine('Set your birth date', BODY_INNER_PX),
      centerLine('in the Phase app on your phone', BODY_INNER_PX),
      '',
      centerLine('Stored only on this device', BODY_INNER_PX),
    ].join('\n');
    return {
      layout: EMPTY_LAYOUT,
      textContents: {
        [CONTAINER.shield]: ' ',
        [CONTAINER.header]: header,
        [CONTAINER.body]: body,
      },
    };
  }

  const [phys, emo, intel] = state.cycles;
  const charts = await Promise.all([
    renderCycleChartPng(phys, CHART_WIDTH, CHART_HEIGHT),
    renderCycleChartPng(emo, CHART_WIDTH, CHART_HEIGHT),
    renderCycleChartPng(intel, CHART_WIDTH, CHART_HEIGHT),
  ]);

  return {
    layout: CHART_LAYOUT,
    textContents: {
      [CONTAINER.shield]: ' ',
      [CONTAINER.header]: header,
      [CONTAINER.frame]: ' ',
      [CONTAINER.physicalRow]: rowText('Physical', phys),
      [CONTAINER.emotionalRow]: rowText('Emotional', emo),
      [CONTAINER.intellectualRow]: rowText('Intellect', intel),
    },
    imageContents: {
      [CONTAINER.physicalChart]: charts[0],
      [CONTAINER.emotionalChart]: charts[1],
      [CONTAINER.intellectualChart]: charts[2],
    },
  };
}
