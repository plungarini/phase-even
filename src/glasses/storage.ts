// storage.ts — Persist birthDate via the SDK's local storage bridge.
// Keeps web localStorage and SDK storage in sync when the webview runs on the phone.

import type { EvenAppBridge } from '@evenrealities/even_hub_sdk';
import { store } from './store';

export const STORAGE_KEY = 'phase:birthDate';

export async function loadPersistedBirthDate(bridge: EvenAppBridge): Promise<void> {
  try {
    const saved = await bridge.getLocalStorage(STORAGE_KEY);
    if (saved) store.setBirthDate(saved);
  } catch (err) {
    console.warn('[Phase:storage] load failed', err);
  }
}

export function mirrorBirthDateToSdk(bridge: EvenAppBridge): () => void {
  let last = store.state.birthDate;
  return store.subscribe((state) => {
    if (state.birthDate === last) return;
    last = state.birthDate;
    const value = state.birthDate ?? '';
    bridge.setLocalStorage(STORAGE_KEY, value).catch((err) =>
      console.warn('[Phase:storage] save failed', err),
    );
  });
}
