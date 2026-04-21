// layout.ts — HUD container layout for Phase.
// Empty state stays text-only. The chart state uses a shield, header, framed body,
// three text rows, three image charts, and a footer date.

import type { HudLayoutDescriptor } from './types';

export const HUD_WIDTH = 576;
export const HUD_HEIGHT = 288;
export const HUD_BORDER_RADIUS = 24;

export const CONTAINER = {
  shield: 'shield',
  header: 'header',
  body: 'body',
  frame: 'frame',
  physicalRow: 'physical-row',
  emotionalRow: 'emotional-row',
  intellectualRow: 'intellectual-row',
  footer: 'footer',
  physicalChart: 'physical-chart',
  emotionalChart: 'emotional-chart',
  intellectualChart: 'intellectual-chart',
} as const;

const HEADER_HEIGHT = 36;
const BODY_Y = HEADER_HEIGHT + 6;
const FRAME_Y = 44;
const FRAME_HEIGHT = 232;
const ROW_X = 24;
const ROW_WIDTH = 214;
const ROW_HEIGHT = 36;
const ROW_PADDING = 2;
const CHART_X = 250;
const CHART_WIDTH = 288;
const CHART_HEIGHT = 32;

export const EMPTY_LAYOUT: HudLayoutDescriptor = {
  key: 'phase.empty.v1',
  textDescriptors: [
    {
      containerID: 0,
      containerName: CONTAINER.shield,
      xPosition: 0,
      yPosition: 0,
      width: HUD_WIDTH,
      height: HUD_HEIGHT,
      borderWidth: 0,
      paddingLength: 0,
      isEventCapture: 1,
    },
    {
      containerID: 1,
      containerName: CONTAINER.header,
      xPosition: 12,
      yPosition: 0,
      width: HUD_WIDTH - 24,
      height: HEADER_HEIGHT,
      paddingLength: 4,
    },
    {
      containerID: 2,
      containerName: CONTAINER.body,
      xPosition: 0,
      yPosition: BODY_Y,
      width: HUD_WIDTH,
      height: HUD_HEIGHT - BODY_Y,
      paddingLength: 15,
      borderWidth: 1,
      borderColor: 13,
      borderRadius: HUD_BORDER_RADIUS,
      isEventCapture: 0,
    },
  ],
};

export const CHART_LAYOUT: HudLayoutDescriptor = {
  key: 'phase.chart.v2',
  textDescriptors: [
    {
      containerID: 0,
      containerName: CONTAINER.shield,
      xPosition: 0,
      yPosition: 0,
      width: HUD_WIDTH,
      height: HUD_HEIGHT,
      borderWidth: 0,
      paddingLength: 0,
      isEventCapture: 1,
    },
    {
      containerID: 1,
      containerName: CONTAINER.header,
      xPosition: 12,
      yPosition: 0,
      width: HUD_WIDTH - 24,
      height: HEADER_HEIGHT,
      paddingLength: 4,
    },
    {
      containerID: 2,
      containerName: CONTAINER.frame,
      xPosition: 0,
      yPosition: FRAME_Y,
      width: HUD_WIDTH,
      height: FRAME_HEIGHT,
      borderWidth: 1,
      borderColor: 13,
      borderRadius: HUD_BORDER_RADIUS,
      paddingLength: 0,
    },
    {
      containerID: 3,
      containerName: CONTAINER.physicalRow,
      xPosition: ROW_X,
      yPosition: 64,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
    {
      containerID: 4,
      containerName: CONTAINER.emotionalRow,
      xPosition: ROW_X,
      yPosition: 118,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
    {
      containerID: 5,
      containerName: CONTAINER.intellectualRow,
      xPosition: ROW_X,
      yPosition: 172,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
    {
      containerID: 6,
      containerName: CONTAINER.footer,
      xPosition: 24,
      yPosition: 228,
      width: HUD_WIDTH - 48,
      height: 28,
      paddingLength: 2,
    },
  ],
  imageDescriptors: [
    {
      containerID: 20,
      containerName: CONTAINER.physicalChart,
      xPosition: CHART_X,
      yPosition: 66,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
    {
      containerID: 21,
      containerName: CONTAINER.emotionalChart,
      xPosition: CHART_X,
      yPosition: 120,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
    {
      containerID: 22,
      containerName: CONTAINER.intellectualChart,
      xPosition: CHART_X,
      yPosition: 174,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
  ],
};

export const HEADER_INNER_PX = HUD_WIDTH - 24 - 8;          // padding*2
export const BODY_INNER_PX = HUD_WIDTH - 2 * (15 + 1);      // padding*2 + border*2
export const ROW_INNER_PX = ROW_WIDTH - ROW_PADDING * 2;
