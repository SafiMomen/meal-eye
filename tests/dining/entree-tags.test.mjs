import assert from "node:assert/strict";
import { test } from "node:test";

import { getHaramEntreeReasons } from "../../lib/dining/entree-tags.ts";

const food = (...religiousTags) => ({ religiousTags });
const cases = [
  ["Haram entree", { Lunch: { Entree: [food("Haram")] } }, "Lunch", true],
  [
    "vegetarian entree",
    { Lunch: { "Vegetarian Entree": [food("Haram")] } },
    "Lunch",
    true,
  ],
  [
    "accented vegetarian and vegan entree",
    { Dinner: { "Vegetarian & Vegan Entrée": [food("Haram")] } },
    "Dinner",
    true,
  ],
  [
    "case-insensitive plural entrees",
    { LUNCH: { ENTREES: [food("Haram")] } },
    "Lunch",
    true,
  ],
  [
    "Haram soup does not flag the hall",
    { Lunch: { Soups: [food("Haram")], Entree: [food()] } },
    "Lunch",
    false,
  ],
  [
    "Haram sides do not flag the hall",
    { Lunch: { "On the Side": [food("Haram")] } },
    "Lunch",
    false,
  ],
  [
    "another meal's entree does not flag this meal",
    { Dinner: { Entree: [food("Haram")] } },
    "Lunch",
    false,
  ],
  [
    "unspecified entrees have no warning",
    { Lunch: { Entree: [food()] } },
    "Lunch",
    false,
  ],
  [
    "positive tags do not become warnings",
    { Lunch: { Entree: [food("Halal", "Kosher")] } },
    "Lunch",
    false,
  ],
  ["empty menu", {}, "Brunch", false],
];

for (const [name, menu, meal, expected] of cases) {
  test(name, () => {
    assert.equal(getHaramEntreeReasons(menu, meal).length > 0, expected);
  });
}

test("hall explanations retain the entree name and ingredient evidence", () => {
  const menu = {
    Dinner: {
      Entree: [
        {
          foodName: "Braised Beef",
          religiousTags: ["Haram"],
          religiousTagReasons: {
            Haram: [
              {
                source: "ingredient",
                text: "red wine",
                category: "alcohol",
                identifiers: ["wine"],
              },
            ],
          },
        },
      ],
      Sides: [
        {
          foodName: "Bacon Beans",
          religiousTags: ["Haram"],
          religiousTagReasons: {
            Haram: [
              {
                source: "ingredient",
                text: "pork",
                category: "pork",
                identifiers: ["pork"],
              },
            ],
          },
        },
      ],
    },
  };
  assert.deepEqual(getHaramEntreeReasons(menu, "Dinner"), [
    {
      source: "ingredient",
      text: "red wine",
      category: "alcohol",
      identifiers: ["wine"],
      foodName: "Braised Beef",
    },
  ]);
  assert.deepEqual(getHaramEntreeReasons(menu, "Lunch"), []);
});
