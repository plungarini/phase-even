// glasses-main.ts — Side-effect entry: boots the glasses HUD.

import { initEventDispatcher } from './glasses/events';
import { HudSession } from './glasses/session';
import { initBridgeStorage } from './glasses/storage';
import { store } from './glasses/store';
import { startTick } from './glasses/tick';
import { renderHudState } from './glasses/view';
import { getEvenBridge } from './bridge';

async function boot(): Promise<void> {
  let bridge;
  try {
    console.log('[GlassesMain] waiting for bridge');
    bridge = await getEvenBridge();
    console.log('[GlassesMain] bridge ready');
  } catch (err) {
    console.warn('[GlassesMain] bridge unavailable (dev browser?)', err);
    return;
  }

  await initBridgeStorage(bridge);

  const session = new HudSession(bridge);
  initEventDispatcher(bridge);

  let isRendering = false;
  let renderQueued = false;

  async function doRender(): Promise<void> {
    const next = await renderHudState(store.state);
    await session.render(next);
  }

  const render = () => {
    if (isRendering) {
      renderQueued = true;
      return;
    }
    isRendering = true;
    void doRender()
      .catch((err) => {
        console.error('[GlassesMain] render failed', err);
      })
      .finally(() => {
        isRendering = false;
        if (renderQueued) {
          renderQueued = false;
          render();
        }
      });
  };

  store.subscribe(render);
  startTick(render);
  console.log('[GlassesMain] triggering initial render');
  render();
}

void boot().catch((err) => {
  console.error('[GlassesMain] fatal boot error', err);
});
