import assert from "node:assert/strict";
import { test } from "node:test";

import { detectReligiousTags } from "./religious-tags.ts";

const cases = [
  ["pork in the food name", { foodName: "Roast Pork" }, ["Haram", "Non-Kosher"]],
  ["pork in ingredients", { ingredients: ["potatoes", "LARD"] }, ["Haram", "Non-Kosher"]],
  ["bacon in a dish", { foodName: "Bacon & Leek Soup" }, ["Haram", "Non-Kosher"]],
  ["alcohol in ingredients", { ingredients: ["sugar", "alcohol"] }, ["Haram"]],
  ["wine used in cooking", { foodName: "Red Wine Sauce" }, ["Haram"]],
  ["wine vinegar is conservatively flagged", { ingredients: ["red wine vinegar"] }, ["Haram"]],
  ["alcohol-free wording is still flagged", { ingredients: ["alcohol-free flavoring"] }, ["Haram"]],
  ["nonalcoholic wording is still flagged", { foodName: "Nonalcoholic Beer" }, ["Haram"]],
  ["spirit names are flagged", { ingredients: ["vanilla", "bourbon"] }, ["Haram"]],
  ["explicit halal chicken", { ingredients: ["Halal Chicken Breast", "salt"] }, ["Halal"]],
  ["a halal label on the food name", { foodName: "Halal Beef Stew" }, ["Halal"]],
  ["a halal metadata label", { explicitTagText: "HALAL" }, ["Halal"]],
  ["unlabelled chicken stays unknown", { foodName: "Grilled Chicken" }, []],
  ["vegetables do not imply certification", { foodName: "Roasted Carrots" }, []],
  ["alcohol overrides a halal label", { ingredients: ["halal chicken", "white wine"] }, ["Haram"]],
  ["pork overrides a halal label", { ingredients: ["halal chicken", "pork bacon"] }, ["Haram", "Non-Kosher"]],
  ["negative halal labels", { explicitTagText: "Non-Halal" }, ["Haram"]],
  ["an explicit haram label", { explicitTagText: "Haram" }, ["Haram"]],
  ["kosher salt is not certification", { ingredients: ["kosher salt"] }, []],
  ["kosher salt in metadata is not certification", { explicitTagText: "kosher salt" }, []],
  ["an explicit kosher label", { explicitTagText: "Kosher" }, ["Kosher"]],
  ["a negative kosher label", { explicitTagText: "Non-Kosher" }, ["Non-Kosher"]],
  ["CJL gets kosher automatically", { diningHallName: "Center for Jewish Life" }, ["Kosher"]],
  ["CJL shorthand", { diningHallName: "cjl" }, ["Kosher"]],
  ["CJL's kosher rule takes precedence", { diningHallName: "Center for Jewish Life (CJL)", explicitTagText: "Non-Kosher" }, ["Kosher"]],
  ["kosher wine can still trigger the alcohol rule", { diningHallName: "Center for Jewish Life", ingredients: ["wine"] }, ["Haram", "Kosher"]],
  ["halal chicken at CJL", { diningHallName: "CJL", ingredients: ["Halal Chicken"] }, ["Halal", "Kosher"]],
  ["no substring matches", { foodName: "Hamburger with Ginger and Plum Crumble" }, []],
];

for (const [name, input, expected] of cases) {
  test(name, () => {
    const tags = detectReligiousTags({ foodName: "Food", ingredients: [], ...input });

    assert.deepEqual(tags, expected);
    assert.equal(tags.includes("Halal") && tags.includes("Haram"), false);
    assert.equal(tags.includes("Kosher") && tags.includes("Non-Kosher"), false);
  });
}
