// home.ts — Logic container for the Phase home screen.
// Read-only HUD; no navigation actions handled.

import type { GlassScreen } from 'even-toolkit/glass-screen-router';
import { renderHomeView } from './HomeView';
import type { AppSnapshot } from '../../shared';

export const homeScreen: GlassScreen<AppSnapshot, void> = {
  display(snapshot) {
    return renderHomeView({
      cycles: snapshot.cycles,
      today: snapshot.today,
      hasBirthDate: snapshot.birthDate !== null,
    });
  },

  action(_action, nav) {
    return nav;
  },
};
