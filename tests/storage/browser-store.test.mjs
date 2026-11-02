import assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserStore } from "../../lib/storage/browser-store.ts";

test("browser stores restore false values without writing defaults during hydration", (context) => {
  const original = globalThis.window;
  const values = new Map([["test", '{"selected":false}']]);
  let writes = 0;
  const events = new Set();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        writes++;
        values.set(key, value);
      },
    },
    addEventListener: (_, callback) => events.add(callback),
    removeEventListener: (_, callback) => events.delete(callback),
  };
  context.after(() => {
    globalThis.window = original;
  });
  const defaults = { selected: true };
  const store = createBrowserStore({
    key: "test",
    initialValue: defaults,
    parse: (value) => (value ? JSON.parse(value) : defaults),
    serialize: JSON.stringify,
  });
  assert.equal(store.getServerSnapshot(), defaults);
  assert.deepEqual(store.getSnapshot(), { selected: false });
  assert.equal(store.getSnapshot(), store.getSnapshot());
  assert.equal(writes, 0);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications++;
  });
  store.update(() => ({ selected: true }));
  assert.equal(writes, 1);
  assert.equal(notifications, 1);
  values.set("test", '{"selected":false}');
  events.forEach((callback) => callback({ key: "test" }));
  assert.equal(store.getSnapshot().selected, false);
  assert.equal(notifications, 2);
  assert.equal(writes, 1);
  unsubscribe();
  assert.equal(events.size, 0);
});

test("blocked browser storage retains working in-memory changes", (context) => {
  const original = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    },
  };
  context.after(() => {
    globalThis.window = original;
  });
  const store = createBrowserStore({
    key: "blocked",
    initialValue: 0,
    parse: JSON.parse,
    serialize: JSON.stringify,
  });
  assert.equal(store.getSnapshot(), 0);
  store.update((value) => value + 1);
  assert.equal(store.getSnapshot(), 1);
});
