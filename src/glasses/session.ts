// session.ts — Thin wrapper over the Even SDK bridge.
// Turns a HudRenderState into the right SDK call:
//   - createStartUpPageContainer on first render
//   - rebuildPageContainer when the layout key changes (or startup reports "already created")
//   - textContainerUpgrade for content-only updates.
// Module-level state (pageCreated, activeLayoutKey, lastContents) guards the
// SDK's rule that createStartUpPageContainer may run at most once per app lifetime.

import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
  type EvenAppBridge,
} from '@evenrealities/even_hub_sdk';

import type { HudLayoutDescriptor, HudRenderState } from './types';

const MAX_CONTENT_CHARS = 900;  // startup/rebuild cap per SDK docs (1000, with headroom)

let pageCreated = false;
let activeLayoutKey: string | null = null;
let lastContents: Record<string, string> = {};

function truncate(v: string, max: number): string {
  return v.length <= max ? v : v.slice(0, Math.max(0, max - 1)) + '…';
}

function instantiate(layout: HudLayoutDescriptor, contents: Record<string, string>) {
  return {
    containerTotalNum: layout.textDescriptors.length,
    textObject: layout.textDescriptors.map(
      (d) =>
        new TextContainerProperty({
          ...d,
          content: truncate(contents[d.containerName] ?? ' ', MAX_CONTENT_CHARS),
        }),
    ),
  };
}

export class HudSession {
  constructor(private readonly bridge: EvenAppBridge) {}

  async render(next: HudRenderState): Promise<void> {
    const params = instantiate(next.layout, next.textContents);

    if (!pageCreated) {
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
        return;
      }
      // The SDK may already have a page (e.g., HMR reload). Fall back to rebuild.
      console.warn('[HudSession] createStartUpPageContainer non-success:', result, '— rebuilding');
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
  }
}
