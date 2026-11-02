import type { BrowserStoreOptions } from "../../types/storage.ts";

/** A stable SSR snapshot and local-only persistence, shared by app features. */
export function createBrowserStore<Value>(options: BrowserStoreOptions<Value>) {
  let current = options.initialValue;
  let initialized = false;
  const listeners = new Set<() => void>();

  function read() {
    try {
      return options.parse(window.localStorage.getItem(options.key));
    } catch {
      return current;
    }
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function synchronize(event: StorageEvent) {
    if (event.key === options.key || event.key === null) {
      current = read();
      initialized = true;
      notify();
    }
  }

  function getSnapshot() {
    if (!initialized) {
      current = read();
      initialized = true;
    }
    return current;
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) {
      window.addEventListener("storage", synchronize);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        window.removeEventListener("storage", synchronize);
      }
    };
  }

  function update(change: (value: Value) => Value) {
    current = change(getSnapshot());
    try {
      window.localStorage.setItem(options.key, options.serialize(current));
    } catch {
      // Retain in-memory functionality when storage is unavailable.
    }
    notify();
  }

  return {
    getSnapshot,
    getServerSnapshot: () => options.initialValue,
    subscribe,
    update,
  };
}
