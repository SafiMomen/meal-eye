import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getEntreeFoods,
  getHallDietaryWarnings,
} from "../../lib/dining/entree-tags.ts";

const bothPreferences = { muslim: true, jewish: true };
const noPreferences = { muslim: false, jewish: false };

function food(foodName, overrides = {}) {
  return {
    foodName,
    ingredients: [],
    allergens: [],
    religiousTags: [],
    religiousTagReasons: {},
    ...overrides,
  };
}

const porkEntree = food("Bacon omelet", {
  allergens: ["Milk", "Eggs"],
  religiousTags: ["Haram", "Non-Kosher"],
  religiousTagReasons: {
    Haram: [{ source: "ingredient", text: "Pork bacon", category: "pork" }],
    "Non-Kosher": [
      { source: "ingredient", text: "Pork bacon", category: "pork" },
    ],
  },
});

test("hall warnings combine all three abbreviated badge categories once", () => {
  const warnings = getHallDietaryWarnings(
    [porkEntree, porkEntree],
    bothPreferences,
    ["Milk", "Eggs"],
  );

  assert.deepEqual(warnings.tags, ["Haram", "Non-Kosher", "Restricted"]);
  assert.equal(warnings.reasons.Haram[0].foodName, "Bacon omelet");
  assert.equal(warnings.reasons["Non-Kosher"][0].text, "Pork bacon");
  assert.deepEqual(warnings.restrictionMatches[0].identifiers, ["milk"]);
});

test("Muslim and Jewish preferences independently control hall warnings", () => {
  const preferences = [
    [{ muslim: true, jewish: false }, ["Haram"]],
    [{ muslim: false, jewish: true }, ["Non-Kosher"]],
    [noPreferences, []],
  ];

  for (const [selection, expected] of preferences) {
    assert.deepEqual(
      getHallDietaryWarnings([porkEntree], selection, []).tags,
      expected,
    );
  }
});

test("restriction badges depend on selected restrictions rather than religion", () => {
  assert.deepEqual(
    getHallDietaryWarnings([porkEntree], noPreferences, ["Milk"]).tags,
    ["Restricted"],
  );
  assert.deepEqual(
    getHallDietaryWarnings([porkEntree], noPreferences, []).tags,
    [],
  );
  assert.deepEqual(
    getHallDietaryWarnings([porkEntree], noPreferences, ["Peanut"]).tags,
    [],
  );
});

test("positive and uncertain classifications do not create hall warning badges", () => {
  const foods = [
    food("Halal chicken", { religiousTags: ["Halal"] }),
    food("Kosher entree", { religiousTags: ["Kosher"] }),
    food("Vegetables"),
  ];
  assert.deepEqual(getHallDietaryWarnings(foods, bothPreferences, []).tags, []);
  assert.deepEqual(
    getHallDietaryWarnings([], bothPreferences, ["Milk"]).tags,
    [],
  );
});

test("Non-Kosher can appear without a Haram tag and without ingredient evidence", () => {
  const warnings = getHallDietaryWarnings(
    [food("Non-Kosher entree", { religiousTags: ["Non-Kosher"] })],
    bothPreferences,
    [],
  );
  assert.deepEqual(warnings.tags, ["Non-Kosher"]);
  assert.equal(warnings.reasons["Non-Kosher"][0].source, "unspecified");
  assert.equal(warnings.reasons["Non-Kosher"][0].foodName, "Non-Kosher entree");
});

test("sidebar badges summarize entrees and ignore sides, soup, and other meals", () => {
  const menu = {
    Lunch: {
      "Vegetarian & Vegan Entrées": [food("Plain tofu")],
      Sides: [porkEntree],
      Soup: [porkEntree],
    },
    Dinner: { Entree: [porkEntree] },
  };
  const lunchEntrees = getEntreeFoods(menu, "Lunch");
  assert.deepEqual(
    lunchEntrees.map((item) => item.foodName),
    ["Plain tofu"],
  );
  assert.deepEqual(
    getHallDietaryWarnings(lunchEntrees, bothPreferences, ["Milk"]).tags,
    [],
  );
  assert.deepEqual(
    getHallDietaryWarnings(getEntreeFoods(menu, "Dinner"), bothPreferences, [
      "Milk",
    ]).tags,
    ["Haram", "Non-Kosher", "Restricted"],
  );
});

test("weekend Brunch badges use source Lunch only when Breakfast is absent", () => {
  const menu = { Lunch: { Entree: [porkEntree] }, Dinner: {} };
  assert.equal(getEntreeFoods(menu, "Brunch", true).length, 1);
  assert.deepEqual(getEntreeFoods(menu, "Brunch", false), []);
  assert.deepEqual(
    getEntreeFoods({ Breakfast: {}, ...menu }, "Brunch", true),
    [],
  );
  assert.deepEqual(getEntreeFoods({ ...menu, Brunch: {} }, "Brunch", true), []);
});

test("changing preferences never mutates the menu or its classification evidence", () => {
  const entree = structuredClone(porkEntree);
  const menu = { Lunch: { Entree: [entree] } };
  const snapshot = structuredClone(menu);
  const foods = getEntreeFoods(menu, "Lunch");
  getHallDietaryWarnings(foods, bothPreferences, ["Milk"]);
  getHallDietaryWarnings(foods, noPreferences, []);
  assert.deepEqual(menu, snapshot);
});
