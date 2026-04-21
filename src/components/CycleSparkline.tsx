import type { CycleSnapshot } from '../biorhythm';
import { cycleValue, sampleCycleCurve } from '../biorhythm';

const SVG_WIDTH = 240;
const SVG_HEIGHT = 72;
const PADDING_X = 4;
const PADDING_Y = 6;
const SAMPLE_COUNT = 48;

function chartPoint(value: number, index: number, total: number) {
  const innerWidth = SVG_WIDTH - PADDING_X * 2;
  const innerHeight = SVG_HEIGHT - PADDING_Y * 2;
  const x = PADDING_X + (index / (total - 1)) * innerWidth;
  const y = PADDING_Y + ((1 - (value + 1) / 2) * innerHeight);
  return { x, y };
}

function buildLinePath(values: number[]): string {
  return values
    .map((value, index) => {
      const { x, y } = chartPoint(value, index, values.length);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(values: number[]): string {
  const linePath = buildLinePath(values);
  const first = chartPoint(values[0] ?? 0, 0, values.length);
  const last = chartPoint(values[values.length - 1] ?? 0, values.length - 1, values.length);
  const midY = SVG_HEIGHT / 2;
  return `${linePath} L ${last.x.toFixed(2)} ${midY.toFixed(2)} L ${first.x.toFixed(2)} ${midY.toFixed(2)} Z`;
}

export function CycleSparkline({ cycle }: { cycle: CycleSnapshot }) {
  const values = sampleCycleCurve(cycle.period, SAMPLE_COUNT);
  const linePath = buildLinePath(values);
  const areaPath = buildAreaPath(values);
  const markerX =
    PADDING_X + (cycle.day / Math.max(cycle.period - 1, 1)) * (SVG_WIDTH - PADDING_X * 2);
  const markerY = PADDING_Y + (1 - (cycleValue(cycle.day, cycle.period) + 1) / 2) * (SVG_HEIGHT - PADDING_Y * 2);
  const toneClass = cycle.value < -0.02 ? 'is-negative' : 'is-positive';

  return (
    <div className={`phase-cycle-chart-shell ${toneClass}`}>
      <svg
        className="phase-cycle-chart"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label={`${cycle.key} cycle chart`}
      >
        <line
          className="phase-cycle-chart-axis"
          x1={PADDING_X}
          y1={SVG_HEIGHT / 2}
          x2={SVG_WIDTH - PADDING_X}
          y2={SVG_HEIGHT / 2}
        />
        <path className="phase-cycle-chart-area" d={areaPath} />
        <path className="phase-cycle-chart-line" d={linePath} />
        <line
          className="phase-cycle-chart-marker-line"
          x1={markerX}
          y1={PADDING_Y}
          x2={markerX}
          y2={SVG_HEIGHT - PADDING_Y}
        />
        <circle className="phase-cycle-chart-marker" cx={markerX} cy={markerY} r="4.5" />
      </svg>
    </div>
  );
}
