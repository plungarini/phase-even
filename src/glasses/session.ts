// session.ts — Thin wrapper over the Even SDK bridge.
// Turns a HudRenderState into the right SDK call:
//   - createStartUpPageContainer on first render
//   - rebuildPageContainer when the layout key changes (or startup reports "already created")
//   - textContainerUpgrade for content-only updates.
// Module-level state (pageCreated, activeLayoutKey, lastContents) guards the
// SDK's rule that createStartUpPageContainer may run at most once per app lifetime.

import {
  CreateStartUpPageContainer,
  ImageContainerProperty,
  ImageRawDataUpdate,
  ImageRawDataUpdateResult,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
  type EvenAppBridge,
} from '@evenrealities/even_hub_sdk';

import type { HudLayoutDescriptor, HudRenderState } from './types';

const MAX_CONTENT_CHARS = 900;  // startup/rebuild cap per SDK docs (1000, with headroom)

let startupAttempted = false;
let pageCreated = false;
let activeLayoutKey: string | null = null;
let lastContents: Record<string, string> = {};
let lastImageHashes: Record<string, number> = {};
let firstImagePass = true;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(v: string, max: number): string {
  return v.length <= max ? v : v.slice(0, Math.max(0, max - 1)) + '…';
}

function instantiate(layout: HudLayoutDescriptor, contents: Record<string, string>) {
  return {
    containerTotalNum: layout.textDescriptors.length + (layout.imageDescriptors?.length ?? 0),
    textObject: layout.textDescriptors.map(
      (d) =>
        new TextContainerProperty({
          ...d,
          content: truncate(contents[d.containerName] ?? ' ', MAX_CONTENT_CHARS),
        }),
    ),
    imageObject: (layout.imageDescriptors ?? []).map(
      (d) =>
        new ImageContainerProperty({
          ...d,
        }),
    ),
  };
}

function hashBytes(bytes: number[]): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export class HudSession {
  constructor(private readonly bridge: EvenAppBridge) {}

  async render(next: HudRenderState): Promise<void> {
    console.log('[HudSession] render start', {
      layout: next.layout.key,
      textCount: next.layout.textDescriptors.length,
      imageCount: next.layout.imageDescriptors?.length ?? 0,
    });
    const params = instantiate(next.layout, next.textContents);

    if (!startupAttempted) {
      startupAttempted = true;
      console.log('[HudSession] first startup-page attempt');
      let result: StartUpPageCreateResult;
      try {
        result = await this.bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer(params),
        );
      } catch (err) {
        console.error('[HudSession] createStartUpPageContainer threw', err);
        return;
      }
      if (result === StartUpPageCreateResult.success) {
        pageCreated = true;
        activeLayoutKey = next.layout.key;
        lastContents = { ...next.textContents };
        console.log('[HudSession] startup page created');
        await this.applyImages(next, true);
        return;
      }
      // Fall back to rebuild for any subsequent attempt in this app lifetime.
      console.warn('[HudSession] createStartUpPageContainer non-success:', result, '— falling back to rebuild');
      await this.rebuild(next, params);
      return;
    }

    if (!pageCreated) {
      console.log('[HudSession] startup already attempted; trying rebuild only');
      await this.rebuild(next, params);
      return;
    }

    if (activeLayoutKey !== next.layout.key) {
      await this.rebuild(next, params);
      return;
    }

    await this.applyUpgrades(next);
  }

  private async rebuild(next: HudRenderState, params: ReturnType<typeof instantiate>): Promise<void> {
    try {
      const ok = await this.bridge.rebuildPageContainer(new RebuildPageContainer(params));
      if (!ok) {
        console.error('[HudSession] rebuildPageContainer returned false');
        return;
      }
      pageCreated = true;
      activeLayoutKey = next.layout.key;
      lastContents = { ...next.textContents };
      lastImageHashes = {};
      firstImagePass = true;
      console.log('[HudSession] rebuild complete');
      await this.applyImages(next, true);
    } catch (err) {
      console.error('[HudSession] rebuildPageContainer threw', err);
    }
  }

  private async applyUpgrades(next: HudRenderState): Promise<void> {
    for (const d of next.layout.textDescriptors) {
      const content = next.textContents[d.containerName] ?? '';
      if (lastContents[d.containerName] === content) continue;
      const prevLen = lastContents[d.containerName]?.length ?? 0;
      try {
        const ok = await this.bridge.textContainerUpgrade(
          new TextContainerUpgrade({
            containerID: d.containerID,
            containerName: d.containerName,
            contentOffset: 0,
            contentLength: Math.max(content.length, prevLen),
            content,
          }),
        );
        if (!ok) {
          console.warn('[HudSession] textContainerUpgrade returned false for', d.containerName);
          continue;
        }
        lastContents[d.containerName] = content;
      } catch (err) {
        console.error('[HudSession] textContainerUpgrade threw', err, 'container:', d.containerName);
      }
    }
    await this.applyImages(next, false);
  }

  private async applyImages(next: HudRenderState, force: boolean): Promise<void> {
    if (!next.layout.imageDescriptors?.length || !next.imageContents) return;

    if (force && firstImagePass) {
      console.log('[HudSession] settling before first image pass');
      await sleep(350);
      firstImagePass = false;
    }

    for (const d of next.layout.imageDescriptors) {
      const bytes = next.imageContents[d.containerName];
      if (!bytes?.length) continue;
      const hash = hashBytes(bytes);
      if (!force && lastImageHashes[d.containerName] === hash) continue;
      try {
        const result = await this.bridge.updateImageRawData(
          new ImageRawDataUpdate({
            containerID: d.containerID,
            containerName: d.containerName,
            imageData: bytes,
          }),
        );
        if (!ImageRawDataUpdateResult.isSuccess(result)) {
          console.error('[HudSession] updateImageRawData failed', {
            container: d.containerName,
            result,
          });
          await sleep(50);
          continue;
        }
        lastImageHashes[d.containerName] = hash;
        console.log('[HudSession] image updated', d.containerName);
        await sleep(50);
      } catch (err) {
        console.error('[HudSession] updateImageRawData threw', err, 'container:', d.containerName);
      }
    }
  }
}
