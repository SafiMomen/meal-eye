import {
  DEFAULT_DIETARY_SETTINGS,
  DIETARY_SETTINGS_STORAGE_KEY,
  parseDietarySettings,
  serializeDietarySettings,
} from "./settings.ts";
import type {
  DietarySettings,
  DietarySettingsUpdater,
} from "../../types/dietary.ts";

let currentSettings: DietarySettings | null = null;
const listeners = new Set<() => void>();

function readBrowserSettings(): DietarySettings {
  try {
    return parseDietarySettings(
      window.localStorage.getItem(DIETARY_SETTINGS_STORAGE_KEY),
    );
  } catch {
    return currentSettings ?? DEFAULT_DIETARY_SETTINGS;
  }
}

export function getDietarySettingsSnapshot(): DietarySettings {
  currentSettings ??= readBrowserSettings();
  return currentSettings;
}

export function getServerDietarySettings(): DietarySettings {
  return DEFAULT_DIETARY_SETTINGS;
}

export function subscribeToDietarySettings(listener: () => void): () => void {
  listeners.add(listener);

  function syncOtherTabs(event: StorageEvent) {
    if (event.key === DIETARY_SETTINGS_STORAGE_KEY || event.key === null) {
      currentSettings = readBrowserSettings();
      listener();
    }
  }

  window.addEventListener("storage", syncOtherTabs);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncOtherTabs);
  };
}

export function updateDietarySettings(update: DietarySettingsUpdater): void {
  currentSettings = update(getDietarySettingsSnapshot());

  try {
    window.localStorage.setItem(
      DIETARY_SETTINGS_STORAGE_KEY,
      serializeDietarySettings(currentSettings),
    );
  } catch {
    // Keep controls usable in memory when browser storage is unavailable.
  }

  listeners.forEach((listener) => listener());
}
