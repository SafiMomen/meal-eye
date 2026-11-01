import assert from "node:assert/strict";
import { test } from "node:test";

import { getRestrictionMatches } from "../../lib/dietary/restrictions.ts";
import { getRestrictionExplanation } from "../../lib/dietary/restriction-explanation.ts";
import { hasDietaryWarning } from "../../lib/dietary/warnings.ts";
import { getVisibleReligiousTags } from "../../lib/dietary/preferences.ts";
import { DIETARY_RESTRICTIONS } from "../../lib/dietary/restriction-identifiers.ts";

const emptyInput = { foodName: "Test dish", ingredients: [], allergens: [] };
const allergenCases = [
  ["Milk", "Milk"],
  ["Eggs", "Egg"],
  ["Fish", "Fish (Salmon)"],
  ["Crustacean Shellfish", "Crustacean Shellfish"],
  ["Tree Nut", "Tree Nuts"],
  ["Peanut", "Peanuts"],
  ["Wheat", "Wheat"],
  ["Soybeans", "Soy"],
  ["Sesame", "Sesame"],
  ["Gluten", "Wheat"],
  ["Alcohol", "Alcohol"],
];

for (const [restriction, allergen] of allergenCases) {
  test(`${restriction} detects declared ${allergen}`, () => {
    const matches = getRestrictionMatches(
      { ...emptyInput, allergens: [allergen] },
      [restriction],
    );
    assert.equal(matches.length, 1);
    assert.equal(matches[0].restriction, restriction);
    assert.equal(matches[0].source, "allergen");
    assert.equal(matches[0].text, allergen);
  });
}

const ingredientCases = [
  ["Milk", "Unsalted butter"],
  ["Eggs", "Pasteurized egg yolks"],
  ["Fish", "Anchovies"],
  ["Crustacean Shellfish", "SHRIMP"],
  ["Tree Nut", "Pine nuts"],
  ["Peanut", "Groundnuts"],
  ["Wheat", "Durum semolina"],
  ["Soybeans", "Tofu"],
  ["Sesame", "Tahini"],
  ["Gluten", "Barley malt"],
  ["Alcohol", "Red-wine vinegar"],
];

for (const [restriction, ingredient] of ingredientCases) {
  test(`${restriction} detects ingredient ${ingredient}`, () => {
    const matches = getRestrictionMatches(
      { ...emptyInput, ingredients: [ingredient] },
      [restriction],
    );
    assert.equal(matches.length, 1);
    assert.equal(matches[0].source, "ingredient");
  });
}

test("no restrictions are selected by default and unmatched foods stay visible", () => {
  assert.deepEqual(
    getRestrictionMatches(
      {
        ...emptyInput,
        allergens: ["Milk", "Eggs"],
      },
      [],
    ),
    [],
  );
  assert.deepEqual(getRestrictionMatches(emptyInput, DIETARY_RESTRICTIONS), []);
});

test("selected restrictions prefer allergen evidence over duplicate text", () => {
  const input = {
    foodName: "Scrambled Eggs",
    ingredients: ["Egg", "Milk"],
    allergens: ["Eggs", "Milk"],
  };
  const matches = getRestrictionMatches(input, ["Eggs", "Milk", "Milk"]);
  assert.equal(matches.length, 2);
  assert.ok(matches.every((match) => match.source === "allergen"));
  assert.deepEqual(getRestrictionMatches(input, ["Sesame"]), []);
});

test("food-name clues work when detailed data is absent", () => {
  const matches = getRestrictionMatches(
    {
      ...emptyInput,
      foodName: "Sesame Salmon",
    },
    ["Fish", "Sesame"],
  );
  assert.equal(matches.length, 2);
  assert.ok(matches.every((match) => match.source === "food-name"));
});

test("whole words avoid unrelated foods and separate nuts from peanuts", () => {
  const input = {
    foodName: "Eggplant with coconut and peanut",
    ingredients: ["Buckwheat", "Mushroom", "Crumble", "Oats"],
    allergens: [],
  };
  assert.deepEqual(
    getRestrictionMatches(input, [
      "Eggs",
      "Tree Nut",
      "Milk",
      "Wheat",
      "Gluten",
      "Alcohol",
    ]),
    [],
  );
  assert.equal(getRestrictionMatches(input, ["Peanut"]).length, 1);
});

test("plant milk and cocoa butter do not imply dairy", () => {
  const input = {
    ...emptyInput,
    ingredients: ["Coconut milk", "Cocoa butter", "Peanut butter", "Oat cream"],
  };
  assert.deepEqual(getRestrictionMatches(input, ["Milk"]), []);
  assert.equal(
    getRestrictionMatches(
      {
        ...input,
        allergens: ["Milk"],
      },
      ["Milk"],
    ).length,
    1,
  );
});

test("free-from wording is not an ingredient match, except conservative Alcohol", () => {
  assert.deepEqual(
    getRestrictionMatches(
      {
        ...emptyInput,
        foodName: "Gluten-free pasta",
        ingredients: ["Milk-free margarine", "Wheat-free flour"],
      },
      ["Milk", "Wheat", "Gluten"],
    ),
    [],
  );
  assert.equal(
    getRestrictionMatches(
      {
        ...emptyInput,
        ingredients: ["Alcohol-free beer"],
      },
      ["Alcohol"],
    ).length,
    1,
  );
});

test("gluten matches rye and barley while Wheat remains separate", () => {
  const input = { ...emptyInput, ingredients: ["Rye", "Barley"] };
  assert.equal(getRestrictionMatches(input, ["Gluten"]).length, 2);
  assert.deepEqual(getRestrictionMatches(input, ["Wheat"]), []);
});

test("restriction explanation is a sentence with individually highlighted terms", () => {
  const matches = getRestrictionMatches(
    {
      ...emptyInput,
      allergens: ["Milk", "Eggs"],
    },
    ["Milk", "Eggs"],
  );
  const explanation = getRestrictionExplanation(matches);
  assert.equal(
    explanation.map((part) => part.text).join(""),
    "The menu lists milk and eggs, matching your Milk and Eggs restrictions.",
  );
  assert.deepEqual(
    explanation.filter((part) => part.highlighted).map((part) => part.text),
    ["milk", "eggs", "Milk", "Eggs"],
  );
});

test("warning tint follows visible prohibited and restriction tags", () => {
  for (const tag of ["Haram", "Non-Kosher", "Restricted"]) {
    assert.equal(hasDietaryWarning([tag]), true);
  }
  assert.equal(hasDietaryWarning(["Halal", "Halal?", "Kosher"]), false);
  assert.equal(
    hasDietaryWarning(
      getVisibleReligiousTags(["Haram", "Non-Kosher"], {
        muslim: false,
        jewish: false,
      }),
    ),
    false,
  );
  assert.equal(hasDietaryWarning([]), false);
});
