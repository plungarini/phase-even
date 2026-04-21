// storage.ts — Persist birthDate via the SDK's local storage bridge.
// The bridge is the source of truth for both the webview and the HUD.

import { waitForEvenAppBridge, type EvenAppBridge } from '@evenrealities/even_hub_sdk';
import { store } from './store';

export const STORAGE_KEY = 'phase:birthDate';

let activeBridge: EvenAppBridge | null = null;
let initPromise: Promise<void> | null = null;
let syncStarted = false;
let lastSavedValue = '';

async function hydrate(bridge: EvenAppBridge): Promise<void> {
  console.log('[Phase:storage] hydrating from bridge');
  const saved = await bridge.getLocalStorage(STORAGE_KEY);
  lastSavedValue = saved ?? '';
  if (saved && saved !== store.state.birthDate) {
    console.log('[Phase:storage] restored birth date', saved);
    store.setBirthDate(saved);
  } else {
    console.log('[Phase:storage] no saved birth date in bridge');
  }
}

function startSync(bridge: EvenAppBridge): void {
  if (syncStarted) return;
  syncStarted = true;
  lastSavedValue = store.state.birthDate ?? '';
  store.subscribe((state) => {
    const value = state.birthDate ?? '';
    if (value === lastSavedValue) return;
    lastSavedValue = value;
    console.log('[Phase:storage] saving birth date to bridge', value || '<empty>');
    bridge.setLocalStorage(STORAGE_KEY, value).then((ok) => {
      if (!ok) {
        console.warn('[Phase:storage] bridge save returned false');
      }
    }).catch((err) => {
      console.error('[Phase:storage] save failed', err);
    });
  });
}

export async function initBridgeStorage(bridge: EvenAppBridge): Promise<void> {
  activeBridge = bridge;
  if (!initPromise) {
    initPromise = hydrate(bridge)
      .catch((err) => {
        console.warn('[Phase:storage] load failed', err);
      })
      .finally(() => {
        startSync(bridge);
      });
  }
  await initPromise;
}

export async function ensureBridgeStorageReady(): Promise<void> {
  if (activeBridge) {
    await initBridgeStorage(activeBridge);
    return;
  }
  try {
    const bridge = await waitForEvenAppBridge();
    await initBridgeStorage(bridge);
  } catch (err) {
    console.warn('[Phase:storage] bridge unavailable for web sync', err);
  }
}
