import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "cheerio";

import { classifyReligiousTags } from "../../lib/dietary/classification.ts";
import { HARAM_IDENTIFIERS } from "../../lib/dietary/identifiers.ts";
import { getRestrictionMatches } from "../../lib/dietary/restrictions.ts";
import { getFoodDietaryStatus } from "../../lib/dietary/food-status.ts";
import { getReligiousTagExplanation } from "../../lib/dietary/explanation.ts";
import { extractMenuFood } from "../../lib/parsing/food.ts";
import { getEligibleHighProteinFoods } from "../../lib/dining/protein-options.ts";
import { getHallDietaryWarnings } from "../../lib/dining/entree-tags.ts";
import { getVisibleMenuCategories } from "../../lib/dining/menu-filtering.ts";
import { DEFAULT_DIETARY_SETTINGS } from "../../lib/dietary/settings.ts";

const muslimPreferences = { muslim: true, jewish: false };

function parseHalalChicken(allergens, ingredients = "Halal Chicken, Salt") {
  const document = load(`
    <div class="accordion-item">
      <div class="accordion-header"><span class="title">Chicken</span></div>
      <div class="nutritionFact">
        Calories: 200<br>Protein: 30g<br>
        Ingredients: ${ingredients}<br>Allergens: ${allergens}
      </div>
      <span data-religious-tag="Halal"></span>
    </div>
  `);
  return extractMenuFood(document(".accordion-item"), "Test Hall");
}

test("alcohol listed only in allergen metadata overrides explicit Halal evidence", () => {
  const food = parseHalalChicken("Alcohol");
  assert.deepEqual(food.religiousTags, ["Haram"]);
  assert.equal(food.religiousTagReasons.Halal, undefined);
  assert.deepEqual(food.religiousTagReasons.Haram, [
    {
      source: "allergen",
      text: "Alcohol",
      category: "alcohol",
      identifiers: ["alcohol"],
    },
  ]);

  const status = getFoodDietaryStatus(food, muslimPreferences, ["Alcohol"]);
  assert.deepEqual(status.tags, ["Haram", "Restricted"]);
  assert.equal(status.shouldAvoid, true);
});

test("Haram classification does not depend on selecting the Alcohol restriction", () => {
  const food = parseHalalChicken("Alcohol");
  assert.deepEqual(getFoodDietaryStatus(food, muslimPreferences, []).tags, [
    "Haram",
  ]);
  assert.deepEqual(
    getFoodDietaryStatus(food, { muslim: false, jewish: false }, ["Alcohol"])
      .tags,
    ["Restricted"],
  );
});

test("all alcohol identifiers agree across names, ingredients, and allergen declarations", () => {
  for (const keyword of HARAM_IDENTIFIERS.alcohol) {
    const inputs = [
      {
        foodName: `Halal chicken with ${keyword}`,
        ingredients: [],
        allergens: [],
      },
      {
        foodName: "Chicken",
        ingredients: ["Halal Chicken", keyword],
        allergens: [],
      },
      {
        foodName: "Chicken",
        ingredients: ["Halal Chicken"],
        allergens: [keyword],
      },
    ];

    for (const input of inputs) {
      assert.ok(getRestrictionMatches(input, ["Alcohol"]).length > 0, keyword);
      const classification = classifyReligiousTags(input);
      assert.ok(classification.religiousTags.includes("Haram"), keyword);
      assert.equal(
        classification.religiousTags.includes("Halal"),
        false,
        keyword,
      );
      assert.equal(
        classification.religiousTagReasons.Halal,
        undefined,
        keyword,
      );
    }
  }
});

test("conservative alcohol wording is identical in both classifiers", () => {
  for (const declaration of [
    "Alcohol-free flavoring",
    "Nonalcoholic beer",
    "RED–WINE vinegar",
    "Wine(s)",
  ]) {
    const food = parseHalalChicken(declaration);
    assert.deepEqual(food.religiousTags, ["Haram"]);
    assert.ok(getRestrictionMatches(food, ["Alcohol"]).length > 0);
  }
});

test("an allergen declaration is explained as metadata rather than an invented ingredient", () => {
  const food = parseHalalChicken("Alcohol");
  const parts = getReligiousTagExplanation(
    "Haram",
    food.religiousTagReasons.Haram,
  );
  assert.equal(
    parts.map((part) => part.text).join(""),
    "The menu's allergen information for this food lists Alcohol, " +
      "which the app flags as Haram for alcohol references.",
  );
  assert.deepEqual(
    parts.filter((part) => part.highlighted).map((part) => part.text),
    ["Alcohol"],
  );
});

test("actual alcohol ingredients remain in the explanation alongside metadata", () => {
  const food = parseHalalChicken("Alcohol", "Halal Chicken, White Wine");
  const reasons = food.religiousTagReasons.Haram;
  assert.ok(
    reasons.some(
      (reason) =>
        reason.source === "ingredient" && reason.text === "White Wine",
    ),
  );
  assert.ok(
    reasons.some(
      (reason) => reason.source === "allergen" && reason.text === "Alcohol",
    ),
  );
});

test("metadata-only alcohol affects hall badges, protein highlights, and hiding", () => {
  const food = parseHalalChicken("Alcohol");
  assert.deepEqual(getHallDietaryWarnings([food], muslimPreferences, []).tags, [
    "Haram",
  ]);
  assert.deepEqual(
    getEligibleHighProteinFoods([food], muslimPreferences, []),
    [],
  );
  assert.deepEqual(
    getVisibleMenuCategories(
      { Entree: [food] },
      {
        ...DEFAULT_DIETARY_SETTINGS,
        preferences: muslimPreferences,
        hideUnwantedMeals: true,
      },
    ),
    {},
  );
});

test("allergen metadata cannot establish positive religious certification", () => {
  assert.deepEqual(
    classifyReligiousTags({
      foodName: "Chicken",
      ingredients: [],
      allergens: ["Halal", "Kosher"],
    }).religiousTags,
    [],
  );
});

test("nonalcoholic substring lookalikes do not trigger either classifier", () => {
  const food = parseHalalChicken("Soy", "Halal Chicken, Ginger, Plum Crumble");
  assert.deepEqual(food.religiousTags, ["Halal"]);
  assert.deepEqual(getRestrictionMatches(food, ["Alcohol"]), []);
});

test("CJL keeps its Kosher location rule while alcohol still overrides Halal", () => {
  const classification = classifyReligiousTags({
    foodName: "Chicken",
    ingredients: ["Halal Chicken"],
    allergens: ["Alcohol"],
    diningHallName: "CJL",
  });
  assert.deepEqual(classification.religiousTags, ["Haram", "Kosher"]);
});
