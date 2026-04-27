import { OsEventTypeList, type EvenAppBridge } from '@evenrealities/even_hub_sdk';

export function initEventDispatcher(bridge: EvenAppBridge): void {
	bridge.onEvenHubEvent((event) => {
		const type = event.textEvent?.eventType ?? event.sysEvent?.eventType;
		if (type === OsEventTypeList.DOUBLE_CLICK_EVENT) {
			bridge.shutDownPageContainer(1).catch((err) => console.error('[GlassesEvents] shutdown failed', err));
		}
		// Single click and scroll are ignored — the HUD is a passive readout.
	});
}
