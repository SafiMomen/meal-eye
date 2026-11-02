import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getVisibleMenuCategories,
  countMenuFoods,
} from "../../lib/dining/menu-filtering.ts";
import {
  getEligibleHighProteinFoods,
  getHighProteinFoods,
} from "../../lib/dining/protein-options.ts";
import {
  getEntreeFoods,
  getHallDietaryWarnings,
} from "../../lib/dining/entree-tags.ts";
import { DEFAULT_DIETARY_SETTINGS } from "../../lib/dietary/settings.ts";

function food(foodName, overrides = {}) {
  return {
    foodName,
    calories: 250,
    proteinGrams: 30,
    ingredients: [],
    allergens: [],
    religiousTags: [],
    religiousTagReasons: {},
    ...overrides,
  };
}

const categories = {
  Entree: [
    food("Pork", { religiousTags: ["Haram", "Non-Kosher"] }),
    food("Chicken", { religiousTags: ["Halal"] }),
    food("Cheese", { allergens: ["Milk"] }),
    food("Large meal", { calories: 800 }),
    food("Unknown calories", { calories: null }),
  ],
  Sides: [food("Fries", { calories: 600 })],
};
const filteredSettings = {
  ...DEFAULT_DIETARY_SETTINGS,
  selectedRestrictions: ["Milk"],
  hideUnwantedMeals: true,
  calorieRange: { minimum: 100, maximum: 500 },
};

test("Hide unwanted meals removes every active warning and prunes empty categories", () => {
  const visible = getVisibleMenuCategories(categories, filteredSettings);
  assert.deepEqual(Object.keys(visible), ["Entree"]);
  assert.deepEqual(
    visible.Entree.map((item) => item.foodName),
    ["Chicken"],
  );
  assert.equal(countMenuFoods(visible), 1);
  assert.equal(countMenuFoods(categories), 6);
});

test("turning hide off keeps restricted cards available for explanations", () => {
  const visible = getVisibleMenuCategories(categories, {
    ...filteredSettings,
    hideUnwantedMeals: false,
  });
  assert.equal(countMenuFoods(visible), 6);
});

test("hidden religious classifications do not filter food by themselves", () => {
  const visible = getVisibleMenuCategories(categories, {
    ...DEFAULT_DIETARY_SETTINGS,
    hideUnwantedMeals: true,
    preferences: { muslim: false, jewish: false },
  });
  assert.equal(countMenuFoods(visible), 6);
});

test("all-blocked meals yield an empty menu without changing the original data", () => {
  const snapshot = structuredClone(categories);
  const visible = getVisibleMenuCategories(categories, {
    ...filteredSettings,
    calorieRange: { minimum: 0, maximum: 0 },
  });
  assert.deepEqual(visible, {});
  assert.equal(countMenuFoods(visible), 0);
  assert.deepEqual(categories, snapshot);
});

test("calorie restrictions reach sidebar R badges and exclude protein highlights", () => {
  const menu = { Lunch: { Entree: [food("Chicken", { calories: 800 })] } };
  const options = getHighProteinFoods(menu, "Lunch");
  const { preferences, calorieRange } = filteredSettings;
  assert.equal(
    getEligibleHighProteinFoods(options, preferences, [], calorieRange).length,
    0,
  );
  const warnings = getHallDietaryWarnings(
    getEntreeFoods(menu, "Lunch"),
    preferences,
    [],
    calorieRange,
  );
  assert.deepEqual(warnings.tags, ["Restricted"]);
  assert.equal(warnings.restrictionMatches[0].calories, 800);
});
