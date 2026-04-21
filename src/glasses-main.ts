// glasses-main.ts — Side-effect entry: boots the glasses HUD.

import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';

import { initEventDispatcher } from './glasses/events';
import { HudSession } from './glasses/session';
import { loadPersistedBirthDate, mirrorBirthDateToSdk } from './glasses/storage';
import { store } from './glasses/store';
import { startTick } from './glasses/tick';
import { renderHudState } from './glasses/view';

async function boot(): Promise<void> {
  let bridge;
  try {
    bridge = await waitForEvenAppBridge();
  } catch (err) {
    console.warn('[GlassesMain] bridge unavailable (dev browser?)', err);
    return;
  }

  await loadPersistedBirthDate(bridge);
  mirrorBirthDateToSdk(bridge);

  const session = new HudSession(bridge);
  initEventDispatcher(bridge);

  // Serialise renders: the next one only fires once the previous has resolved.
  let pending: Promise<void> = Promise.resolve();
  const render = () => {
    pending = pending.then(async () => {
      const next = await renderHudState(store.state);
      await session.render(next);
    });
  };

  store.subscribe(render);
  startTick(render);
  render();
}

void boot();
