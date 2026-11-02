"use client";

import { useSyncExternalStore } from "react";
import {
  getDietarySettingsSnapshot,
  getServerDietarySettings,
  subscribeToDietarySettings,
} from "@/lib/dietary/settings-store";

export function usePersistedDietarySettings() {
  return useSyncExternalStore(
    subscribeToDietarySettings,
    getDietarySettingsSnapshot,
    getServerDietarySettings,
  );
}
