import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getEligibleHighProteinFoods,
  getHighProteinFoods,
} from "../../lib/dining/protein-options.ts";
import { resolveMealPeriod } from "../../lib/dining/meal-periods.ts";

const bothPreferences = { muslim: true, jewish: true };
const noPreferences = { muslim: false, jewish: false };

function food(foodName, proteinGrams, overrides = {}) {
  return {
    foodName,
    proteinGrams,
    religiousTags: [],
    ingredients: [],
    allergens: [],
    ...overrides,
  };
}

function names(foods) {
  return foods.map((item) => item.foodName);
}

test("protein eligibility includes 20g and excludes lower or missing values", () => {
  const menu = {
    Lunch: {
      Entree: [
        food("Exactly enough", 20),
        food("More protein", 31.3),
        food("Below threshold", 19.9),
        food("Missing", null),
        food("Invalid", NaN),
        food("Infinite", Infinity),
      ],
    },
  };

  assert.deepEqual(names(getHighProteinFoods(menu, "Lunch")), [
    "Exactly enough",
    "More protein",
  ]);
});

test("only the displayed meal qualifies, across all food categories", () => {
  const menu = {
    Breakfast: { Entree: [food("Breakfast eggs", 12)] },
    Lunch: { Grill: [food("Chicken", 31)], Salad: [food("Tofu salad", 22)] },
    Dinner: { Entree: [food("Dinner steak", 40)] },
  };

  assert.deepEqual(names(getHighProteinFoods(menu, "Lunch")), [
    "Chicken",
    "Tofu salad",
  ]);
  assert.deepEqual(getHighProteinFoods(menu, "Breakfast"), []);
  assert.deepEqual(getHighProteinFoods({}, "Dinner"), []);
  assert.deepEqual(getHighProteinFoods({ Lunch: {} }, "Dinner"), []);
});

test("weekend protein markers use the same hall-specific Brunch mapping", () => {
  const yeh = { Lunch: { Grill: [food("Chicken", 31)] } };
  const whitman = {
    Breakfast: { Entree: [food("Eggs", 10)] },
    Lunch: { Entree: [food("Steak", 28)] },
  };

  assert.deepEqual(names(getHighProteinFoods(yeh, "Brunch", true)), [
    "Chicken",
  ]);
  assert.deepEqual(getHighProteinFoods(yeh, "Brunch", false), []);
  assert.deepEqual(getHighProteinFoods(whitman, "Brunch", true), []);
  const whitmanMeal = resolveMealPeriod("Brunch", true, whitman);
  assert.deepEqual(names(getHighProteinFoods(whitman, whitmanMeal, true)), [
    "Steak",
  ]);
});

test("a genuine Brunch period does not inherit Lunch protein markers", () => {
  const menu = {
    Brunch: { Entree: [food("Potatoes", 4)] },
    Lunch: { Entree: [food("Steak", 30)] },
  };

  assert.deepEqual(getHighProteinFoods(menu, "Brunch", true), []);
});

const preferenceCases = [
  ["Muslim excludes Haram", ["Haram"], { muslim: true, jewish: false }, false],
  [
    "Jewish excludes Non-Kosher",
    ["Non-Kosher"],
    { muslim: false, jewish: true },
    false,
  ],
  ["Muslim permits an explicit Halal label", ["Halal"], bothPreferences, true],
  ["Jewish permits a Kosher label", ["Kosher"], bothPreferences, true],
  [
    "Haram does not qualify despite a positive label",
    ["Halal", "Haram"],
    bothPreferences,
    false,
  ],
  [
    "unknown tags retain the cards' uncertainty rules",
    [],
    bothPreferences,
    true,
  ],
  [
    "disabled religious preferences do not block food",
    ["Haram", "Non-Kosher"],
    noPreferences,
    true,
  ],
  [
    "Jewish alone does not apply the Muslim warning",
    ["Haram"],
    { muslim: false, jewish: true },
    true,
  ],
];

for (const [name, tags, preferences, qualifies] of preferenceCases) {
  test(name, () => {
    const options = [food("Test entree", 30, { religiousTags: tags })];
    assert.equal(
      getEligibleHighProteinFoods(options, preferences, []).length > 0,
      qualifies,
    );
  });
}

test("restriction matches exclude food even with religious preferences disabled", () => {
  const options = [
    food("Cheese omelet", 25, { allergens: ["Milk", "Eggs"] }),
    food("Peanut tofu", 30, { ingredients: ["Tofu", "Peanut sauce"] }),
    food("Wine-braised beef", 35, { ingredients: ["Cooking wine"] }),
  ];

  assert.deepEqual(
    names(getEligibleHighProteinFoods(options, noPreferences, ["Milk"])),
    ["Peanut tofu", "Wine-braised beef"],
  );
  assert.deepEqual(
    getEligibleHighProteinFoods(options, noPreferences, [
      "Eggs",
      "Peanut",
      "Alcohol",
    ]),
    [],
  );
  assert.equal(
    getEligibleHighProteinFoods(options, noPreferences, []).length,
    3,
  );
});

test("a hall qualifies when at least one protein option remains eligible", () => {
  const options = [
    food("Pork", 25, { religiousTags: ["Haram", "Non-Kosher"] }),
    food("Halal chicken", 31, { religiousTags: ["Halal"] }),
  ];

  assert.deepEqual(
    names(getEligibleHighProteinFoods(options, bothPreferences, [])),
    ["Halal chicken"],
  );
  assert.deepEqual(
    getEligibleHighProteinFoods(options.slice(0, 1), bothPreferences, []),
    [],
  );
});

test("repeated preference changes leave menu data unchanged", () => {
  const chicken = food("Chicken", 31, { allergens: ["Milk"] });
  const menu = { Lunch: { Grill: [chicken] } };
  const snapshot = structuredClone(menu);
  const options = getHighProteinFoods(menu, "Lunch");

  assert.equal(
    getEligibleHighProteinFoods(options, bothPreferences, ["Milk"]).length,
    0,
  );
  assert.equal(
    getEligibleHighProteinFoods(options, bothPreferences, []).length,
    1,
  );
  assert.deepEqual(menu, snapshot);
});
