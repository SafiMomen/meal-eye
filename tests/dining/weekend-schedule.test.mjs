import assert from "node:assert/strict";
import { test } from "node:test";

import { isPrincetonWeekend } from "../../lib/dining/calendar.ts";
import { getHaramEntreeReasons } from "../../lib/dining/entree-tags.ts";
import {
  createDiningHref,
  getMealPeriods,
  resolveMealPeriod,
} from "../../lib/dining/meal-periods.ts";
import { findMenuPeriod } from "../../lib/dining/menu-periods.ts";

const calendarCases = [
  ["Friday", "2026-10-30T16:00:00Z", false],
  ["Saturday", "2026-10-31T16:00:00Z", true],
  ["Sunday", "2026-11-01T16:00:00Z", true],
  ["Monday", "2026-11-02T16:00:00Z", false],
  ["Friday night despite Saturday UTC", "2026-10-31T03:59:59Z", false],
  ["Saturday begins at Eastern midnight", "2026-10-31T04:00:00Z", true],
  ["Sunday night despite Monday UTC", "2026-11-02T04:59:59Z", true],
  [
    "Monday begins at Eastern midnight after DST",
    "2026-11-02T05:00:00Z",
    false,
  ],
];

for (const [name, timestamp, expected] of calendarCases) {
  test(`Princeton weekend detection: ${name}`, () => {
    assert.equal(isPrincetonWeekend(new Date(timestamp)), expected);
  });
}

test("weekends without a selected menu default to Brunch and Dinner", () => {
  assert.deepEqual(getMealPeriods(true), ["Brunch", "Dinner"]);
});

test("weekend halls publishing Breakfast retain Breakfast and Lunch", () => {
  const menu = { Breakfast: {}, Lunch: {}, Dinner: {} };
  assert.deepEqual(getMealPeriods(true, menu), [
    "Breakfast",
    "Lunch",
    "Dinner",
  ]);
  assert.equal(resolveMealPeriod("breakfast", true, menu), "Breakfast");
  assert.equal(resolveMealPeriod("lunch", true, menu), "Lunch");
  assert.equal(findMenuPeriod(menu, "Brunch", true), undefined);
});

test("weekend halls without Breakfast relabel only Lunch as Brunch", () => {
  const menu = { Lunch: {}, Dinner: {} };
  assert.deepEqual(getMealPeriods(true, menu), ["Brunch", "Dinner"]);
  assert.equal(resolveMealPeriod("lunch", true, menu), "Brunch");
  assert.equal(findMenuPeriod(menu, "Brunch", true)[0], "Lunch");
});

test("hall switches preserve midday service and adapt unavailable Breakfast", () => {
  const whitman = { Breakfast: {}, Lunch: {}, Dinner: {} };
  const yeh = { Lunch: {}, Dinner: {} };
  assert.equal(resolveMealPeriod("Brunch", true, whitman), "Lunch");
  assert.equal(resolveMealPeriod("Lunch", true, yeh), "Brunch");
  assert.equal(resolveMealPeriod("Breakfast", true, yeh), "Brunch");
  assert.equal(resolveMealPeriod("Dinner", true, whitman), "Dinner");
  assert.equal(resolveMealPeriod("Dinner", true, yeh), "Dinner");
});

test("options reflect only recognized published periods in meal order", () => {
  const menu = { DINNER: {}, " breakfast ": {}, Lunch: {}, Other: {} };
  assert.deepEqual(getMealPeriods(true, menu), [
    "Breakfast",
    "Lunch",
    "Dinner",
  ]);
  assert.deepEqual(getMealPeriods(false, { Dinner: {} }), ["Dinner"]);
  assert.equal(resolveMealPeriod(undefined, false, { Dinner: {} }), "Dinner");
});

test("genuine Brunch is supported on weekdays without duplicate weekend choices", () => {
  assert.deepEqual(getMealPeriods(false, { Brunch: {}, Dinner: {} }), [
    "Brunch",
    "Dinner",
  ]);
  assert.deepEqual(
    getMealPeriods(true, { Brunch: {}, Lunch: {}, Dinner: {} }),
    ["Brunch", "Dinner"],
  );
});

test("weekdays show Breakfast, Lunch, and Dinner", () => {
  assert.deepEqual(getMealPeriods(false), ["Breakfast", "Lunch", "Dinner"]);
});

test("weekend legacy links and missing choices select Brunch", () => {
  for (const requestedMeal of [
    "breakfast",
    "lunch",
    "BRUNCH",
    "invalid",
    undefined,
  ]) {
    assert.equal(resolveMealPeriod(requestedMeal, true), "Brunch");
  }

  assert.equal(resolveMealPeriod("DINNER", true), "Dinner");
});

test("weekdays accept normal meals and normalize old Brunch links", () => {
  assert.equal(resolveMealPeriod("breakfast", false), "Breakfast");
  assert.equal(resolveMealPeriod("LUNCH", false), "Lunch");
  assert.equal(resolveMealPeriod("Dinner", false), "Dinner");
  assert.equal(resolveMealPeriod("Brunch", false), "Lunch");
});

test("weekend links use the public Brunch name", () => {
  const selectedMeal = resolveMealPeriod("lunch", true);
  assert.deepEqual(createDiningHref(selectedMeal, "Test Hall"), {
    pathname: "/",
    query: { hall: "Test Hall", meal: "brunch" },
  });
});

test("weekend Brunch reads a source Lunch menu without changing its data", () => {
  const lunch = { Entree: [{ foodName: "Bacon" }] };
  const menu = { Lunch: lunch };
  const selectedPeriod = findMenuPeriod(menu, "Brunch", true);

  assert.equal(selectedPeriod[0], "Lunch");
  assert.equal(selectedPeriod[1], lunch);
  assert.deepEqual(Object.keys(menu), ["Lunch"]);
});

test("a genuine Brunch menu takes precedence over the Lunch alias", () => {
  const brunch = { Entree: [] };
  const menu = { Lunch: { Other: [] }, Brunch: brunch };
  assert.equal(findMenuPeriod(menu, "Brunch", true)[1], brunch);
});

test("source-period matching is case insensitive", () => {
  const lunch = { Entree: [] };
  assert.equal(findMenuPeriod({ LUNCH: lunch }, "Brunch", true)[1], lunch);
});

test("Lunch-to-Brunch aliasing is restricted to weekends and midday", () => {
  const menu = { Lunch: { Entree: [] } };
  assert.equal(findMenuPeriod(menu, "Brunch", false), undefined);
  assert.equal(findMenuPeriod(menu, "Dinner", true), undefined);
  assert.equal(findMenuPeriod({ Dinner: {} }, "Brunch", true), undefined);
});

test("weekend sidebar warnings use the same Lunch menu as Brunch cards", () => {
  const menu = {
    Lunch: {
      Entree: [
        {
          foodName: "Bacon",
          religiousTags: ["Haram"],
          religiousTagReasons: {
            Haram: [{ source: "ingredient", text: "Pork", category: "pork" }],
          },
        },
      ],
    },
  };

  assert.equal(getHaramEntreeReasons(menu, "Brunch", false).length, 0);
  assert.deepEqual(getHaramEntreeReasons(menu, "Brunch", true), [
    {
      source: "ingredient",
      text: "Pork",
      category: "pork",
      foodName: "Bacon",
    },
  ]);
});

test("genuine Brunch warnings do not inherit unrelated Lunch flags", () => {
  const menu = {
    Lunch: { Entree: [{ religiousTags: ["Haram"] }] },
    Brunch: { Entree: [{ religiousTags: [] }] },
  };

  assert.deepEqual(getHaramEntreeReasons(menu, "Brunch", true), []);
});
