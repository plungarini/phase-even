import { waitForEvenAppBridge, type EvenAppBridge } from '@evenrealities/even_hub_sdk';

let bridgePromise: Promise<EvenAppBridge> | null = null;

export function getEvenBridge(): Promise<EvenAppBridge> {
  if (!bridgePromise) {
    bridgePromise = waitForEvenAppBridge();
  }
  return bridgePromise;
}
