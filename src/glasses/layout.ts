// layout.ts — HUD container layout for Phase.
// Matches the shared shell proportions from the-void / smokeless:
// 40px header, 37px body start, 8px border radius.

import type { HudLayoutDescriptor } from './types';

export const HUD_WIDTH = 576;
export const HUD_HEIGHT = 288;
export const HUD_BORDER_RADIUS = 8;

export const CONTAINER = {
  shield: 'shield',
  header: 'header',
  body: 'body',
  frame: 'frame',
  physicalRow: 'physical-row',
  emotionalRow: 'emotional-row',
  intellectualRow: 'intellectual-row',
  physicalChart: 'physical-chart',
  emotionalChart: 'emotional-chart',
  intellectualChart: 'intellectual-chart',
} as const;

const HEADER_HEIGHT = 40;
const BODY_Y = 37;
const BODY_HEIGHT = HUD_HEIGHT - BODY_Y;
const FRAME_Y = BODY_Y;
const FRAME_HEIGHT = BODY_HEIGHT;
const ROW_X = 24;
const ROW_WIDTH = 212;
const ROW_HEIGHT = 58;
const ROW_PADDING = 4;
const CHART_X = 248;
const CHART_WIDTH = 288;
const CHART_HEIGHT = 42;
const PHYSICAL_ROW_Y = 56;
const EMOTIONAL_ROW_Y = 118;
const INTELLECTUAL_ROW_Y = 180;
const CHART_Y_OFFSET = 8;

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
      height: BODY_HEIGHT,
      paddingLength: 15,
      borderWidth: 1,
      borderColor: 13,
      borderRadius: HUD_BORDER_RADIUS,
      isEventCapture: 0,
    },
  ],
};

export const CHART_LAYOUT: HudLayoutDescriptor = {
  key: 'phase.chart.v3',
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
      yPosition: PHYSICAL_ROW_Y,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
    {
      containerID: 4,
      containerName: CONTAINER.emotionalRow,
      xPosition: ROW_X,
      yPosition: EMOTIONAL_ROW_Y,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
    {
      containerID: 5,
      containerName: CONTAINER.intellectualRow,
      xPosition: ROW_X,
      yPosition: INTELLECTUAL_ROW_Y,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      paddingLength: ROW_PADDING,
    },
  ],
  imageDescriptors: [
    {
      containerID: 20,
      containerName: CONTAINER.physicalChart,
      xPosition: CHART_X,
      yPosition: PHYSICAL_ROW_Y + CHART_Y_OFFSET,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
    {
      containerID: 21,
      containerName: CONTAINER.emotionalChart,
      xPosition: CHART_X,
      yPosition: EMOTIONAL_ROW_Y + CHART_Y_OFFSET,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
    {
      containerID: 22,
      containerName: CONTAINER.intellectualChart,
      xPosition: CHART_X,
      yPosition: INTELLECTUAL_ROW_Y + CHART_Y_OFFSET,
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
    },
  ],
};

export const HEADER_INNER_PX = HUD_WIDTH - 24 - 8;          // padding*2
export const BODY_INNER_PX = HUD_WIDTH - 2 * (15 + 1);      // padding*2 + border*2
export const ROW_INNER_PX = ROW_WIDTH - ROW_PADDING * 2;
