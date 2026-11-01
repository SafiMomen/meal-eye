import assert from "node:assert/strict";
import { test } from "node:test";

import { getMenuAvailability } from "../../lib/dining/availability.ts";
import {
  createDiningHref,
  readSearchParam,
  resolveMealPeriod,
} from "../../lib/dining/meal-periods.ts";
import { formatNutrient } from "../../lib/nutrition/format.ts";

test("availability distinguishes empty menus from request failures", () => {
  assert.equal(getMenuAvailability(null), "unknown");
  assert.equal(getMenuAvailability({}), "empty");
  assert.equal(getMenuAvailability({ Brunch: {} }), "available");
});

test("weekday selection is case insensitive with a Lunch fallback", () => {
  assert.equal(resolveMealPeriod("BRUNCH"), "Lunch");
  assert.equal(resolveMealPeriod("dinner"), "Dinner");
  assert.equal(resolveMealPeriod("unknown"), "Lunch");
  assert.equal(resolveMealPeriod(undefined), "Lunch");
});

test("array search parameters remain rejected", () => {
  assert.equal(readSearchParam(["Dinner"]), undefined);
  assert.equal(readSearchParam("Dinner"), "Dinner");
});

test("hall and meal links retain their existing query contract", () => {
  assert.deepEqual(createDiningHref("Brunch", "CJL"), {
    pathname: "/",
    query: { hall: "CJL", meal: "brunch" },
  });
  assert.deepEqual(createDiningHref("Dinner"), {
    pathname: "/",
    query: { meal: "dinner" },
  });
});

test("nutrition formatting distinguishes zero from missing values", () => {
  assert.equal(formatNutrient(0, "g"), "0g");
  assert.equal(formatNutrient(null), "N/A");
  assert.equal(formatNutrient(1.5, "mg"), "1.5mg");
});
