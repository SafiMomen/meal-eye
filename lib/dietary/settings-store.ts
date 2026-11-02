import {
  DEFAULT_DIETARY_SETTINGS,
  DIETARY_SETTINGS_STORAGE_KEY,
  parseDietarySettings,
  serializeDietarySettings,
} from "./settings.ts";
import { createBrowserStore } from "../storage/browser-store.ts";

const store = createBrowserStore({
  key: DIETARY_SETTINGS_STORAGE_KEY,
  initialValue: DEFAULT_DIETARY_SETTINGS,
  parse: parseDietarySettings,
  serialize: serializeDietarySettings,
});

export const getDietarySettingsSnapshot = store.getSnapshot;
export const getServerDietarySettings = store.getServerSnapshot;
export const subscribeToDietarySettings = store.subscribe;
export const updateDietarySettings = store.update;
