// layout.ts — HUD container layout for Phase.
// Three text containers only: invisible shield (event capture), top header,
// bordered body. All content lives in `body` as multi-line centered text,
// keeping things simple and mirroring the-void's layout.

import type { HudLayoutDescriptor } from './types';

export const HUD_WIDTH = 576;
export const HUD_HEIGHT = 288;
export const HUD_BORDER_RADIUS = 24;

export const CONTAINER = {
  shield: 'shield',
  header: 'header',
  body: 'body',
} as const;

const HEADER_HEIGHT = 36;
const BODY_Y = HEADER_HEIGHT + 6;

export const LAYOUT: HudLayoutDescriptor = {
  key: 'phase.v1',
  textDescriptors: [
    // 0 — full-screen invisible event capture.
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
    // 1 — thin top header strip, no border.
    {
      containerID: 1,
      containerName: CONTAINER.header,
      xPosition: 12,
      yPosition: 0,
      width: HUD_WIDTH - 24,
      height: HEADER_HEIGHT,
      paddingLength: 4,
    },
    // 2 — bordered body, everything else renders here.
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

export const HEADER_INNER_PX = HUD_WIDTH - 24 - 8;          // padding*2
export const BODY_INNER_PX = HUD_WIDTH - 2 * (15 + 1);      // padding*2 + border*2
