import assert from "node:assert/strict";
import { test } from "node:test";

import { getCalorieRestriction } from "../../lib/dietary/calories.ts";
import { getFoodDietaryStatus } from "../../lib/dietary/food-status.ts";
import { getRestrictionExplanation } from "../../lib/dietary/restriction-explanation.ts";

const range = { minimum: 100, maximum: 500 };
const food = (calories) => ({ foodName: "Test meal", calories });

test("calorie boundaries are inclusive and out-of-range values are restricted", () => {
  for (const calories of [100, 250, 500]) {
    assert.equal(getCalorieRestriction(food(calories), range), null);
  }
  for (const calories of [0, 99, 501, 10000]) {
    const match = getCalorieRestriction(food(calories), range);
    assert.equal(match.source, "calories");
    assert.equal(match.calories, calories);
    assert.deepEqual(match.range, range);
  }
});

test("no range permits all calorie values without imposing a hidden upper cap", () => {
  const allCalories = { minimum: 0, maximum: null };
  for (const calories of [0, 2500, 10000, null]) {
    assert.equal(getCalorieRestriction(food(calories), allCalories), null);
  }
  assert.equal(
    getCalorieRestriction(food(10000), { minimum: 2000, maximum: null }),
    null,
  );
});

test("missing calories are restricted only when a range is active", () => {
  for (const calories of [null, undefined, NaN, Infinity]) {
    const match = getCalorieRestriction(food(calories), range);
    assert.equal(match.calories, null);
    assert.equal(match.restriction, "Calories");
  }
});

test("zero calories remain a real value rather than missing data", () => {
  assert.equal(
    getCalorieRestriction(food(0), { minimum: 0, maximum: 0 }),
    null,
  );
  assert.equal(
    getCalorieRestriction(food(1), { minimum: 0, maximum: 0 }).calories,
    1,
  );
});

test("ingredient and calorie restrictions share one Restricted badge", () => {
  const status = getFoodDietaryStatus(
    {
      foodName: "Cheese omelet",
      calories: 600,
      religiousTags: ["Halal"],
      ingredients: [],
      allergens: ["Milk"],
    },
    { muslim: false, jewish: false },
    ["Milk"],
    range,
  );

  assert.deepEqual(status.tags, ["Restricted"]);
  assert.equal(status.shouldAvoid, true);
  assert.equal(status.restrictionMatches.length, 2);
  const explanation = getRestrictionExplanation(status.restrictionMatches);
  const text = explanation.map((part) => part.text).join("");
  assert.match(text, /menu lists milk/);
  assert.match(
    text,
    /600 kcal, outside your selected range of 100 to 500 kcal/,
  );
});

test("calorie explanations name the dish and its published calories", () => {
  const explanation = getRestrictionExplanation([
    getCalorieRestriction(food(600), range),
  ]);
  assert.equal(
    explanation.map((part) => part.text).join(""),
    "Test meal has 600 kcal, outside your selected range of 100 to 500 kcal.",
  );
  assert.deepEqual(
    explanation.filter((part) => part.highlighted).map((part) => part.text),
    ["600 kcal", "100 to 500 kcal"],
  );
});

test("unknown calorie explanations state that the menu has missing data", () => {
  const explanation = getRestrictionExplanation([
    getCalorieRestriction(food(null), range),
  ]);
  assert.match(
    explanation.map((part) => part.text).join(""),
    /does not list calories/,
  );
});
