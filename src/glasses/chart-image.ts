import type { CycleSnapshot } from '../biorhythm';
import { cycleValue, sampleCycleCurve } from '../biorhythm';
import { canvasToPngBytes } from 'even-toolkit/png-utils';

const SAMPLE_COUNT = 48;

type ChartCanvas = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

let cachedCanvas: ChartCanvas | null = null;

function getCanvas(width: number, height: number): ChartCanvas {
  if (!cachedCanvas || cachedCanvas.canvas.width !== width || cachedCanvas.canvas.height !== height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    cachedCanvas = { canvas, ctx: canvas.getContext('2d')! };
  }
  return cachedCanvas;
}

function yForValue(value: number, height: number, paddingY: number): number {
  const innerHeight = height - paddingY * 2;
  return paddingY + (1 - (value + 1) / 2) * innerHeight;
}

export async function renderCycleChartPng(
  cycle: CycleSnapshot,
  width: number,
  height: number,
): Promise<Uint8Array> {
  const { canvas, ctx } = getCanvas(width, height);
  const paddingX = 6;
  const paddingY = 5;
  const values = sampleCycleCurve(cycle.period, SAMPLE_COUNT);
  const innerWidth = width - paddingX * 2;
  const markerX = paddingX + (cycle.day / Math.max(cycle.period - 1, 1)) * innerWidth;
  const markerY = yForValue(cycleValue(cycle.day, cycle.period), height, paddingY);
  const tone = cycle.value < -0.02 ? 196 : 255;
  const toneRgb = `rgb(${tone}, ${tone}, ${tone})`;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, height / 2);
  ctx.lineTo(width - paddingX, height / 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(markerX, paddingY);
  ctx.lineTo(markerX, height - paddingY);
  ctx.stroke();

  ctx.beginPath();
  values.forEach((value, index) => {
    const x = paddingX + (index / (values.length - 1)) * innerWidth;
    const y = yForValue(value, height, paddingY);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = toneRgb;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.fillStyle = toneRgb;
  ctx.beginPath();
  ctx.arc(markerX, markerY, 3, 0, Math.PI * 2);
  ctx.fill();

  const bytes = await canvasToPngBytes(canvas);
  return Uint8Array.from(bytes);
}
