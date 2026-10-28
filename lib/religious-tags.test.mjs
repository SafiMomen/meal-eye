import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyReligiousTags, detectReligiousTags, HARAM_IDENTIFIERS } from "./religious-tags.ts";

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

test("every prohibited keyword retains its exact ingredient as evidence", () => {
  for (const [category, identifiers] of Object.entries(HARAM_IDENTIFIERS)) {
    for (const keyword of identifiers) {
      const ingredient = `Sauce containing ${keyword}`;
      const result = classifyReligiousTags({ foodName: "Food", ingredients: [ingredient] });
      assert.ok(result.religiousTags.includes("Haram"), keyword);
      assert.ok(result.religiousTagReasons.Haram.some((reason) =>
        reason.source === "ingredient" && reason.text === ingredient &&
        reason.identifiers.includes(keyword) && reason.category === category), keyword);
      if (category === "pork") {
        assert.deepEqual(result.religiousTagReasons["Non-Kosher"], result.religiousTagReasons.Haram);
      } else {
        assert.equal(result.religiousTagReasons["Non-Kosher"], undefined);
      }
    }
  }
});

test("all matching ingredients are retained, not just the first", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: ["Pork Bacon", "Red Wine Vinegar"] });
  assert.ok(result.religiousTagReasons.Haram.some((reason) => reason.text === "Pork Bacon"));
  assert.ok(result.religiousTagReasons.Haram.some((reason) => reason.text === "Red Wine Vinegar"));
  assert.equal(result.religiousTagReasons["Non-Kosher"].length, 1);
  assert.equal(result.religiousTagReasons["Non-Kosher"][0].text, "Pork Bacon");
});

test("a food-name match is not misrepresented as an ingredient", () => {
  const result = classifyReligiousTags({ foodName: "Bacon Soup", ingredients: [] });
  assert.equal(result.religiousTagReasons.Haram[0].source, "food-name");
  assert.equal(result.religiousTagReasons.Haram[0].text, "Bacon Soup");
});

test("explicit negative labels explain the label without inventing ingredients", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: [], explicitTagText: "Non-Halal Non-Kosher" });
  assert.equal(result.religiousTagReasons.Haram[0].source, "menu-label");
  assert.equal(result.religiousTagReasons["Non-Kosher"][0].source, "menu-label");
  assert.equal(JSON.stringify(result.religiousTagReasons).includes("pork"), false);
});

test("Halal explanations retain the explicit Halal ingredient", () => {
  const result = classifyReligiousTags({ foodName: "Chicken Curry", ingredients: ["Halal Chicken Breast", "Salt"] });
  assert.deepEqual(result.religiousTags, ["Halal"]);
  assert.equal(result.religiousTagReasons.Halal[0].text, "Halal Chicken Breast");
});

test("prohibited keywords override positive labels and discard positive explanations", () => {
  const result = classifyReligiousTags({ foodName: "Halal Chicken", ingredients: ["White Wine"] });
  assert.deepEqual(result.religiousTags, ["Haram"]);
  assert.equal(result.religiousTagReasons.Halal, undefined);
  assert.equal(result.religiousTagReasons.Haram[0].text, "White Wine");
});

test("CJL explains its location rule rather than inventing a Kosher ingredient", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: [], diningHallName: "CJL" });
  assert.deepEqual(result.religiousTags, ["Kosher"]);
  assert.equal(result.religiousTagReasons.Kosher[0].source, "location");
  assert.ok(result.religiousTagReasons.Kosher[0].text.includes("Center for Jewish Life"));
});

test("unknown foods do not acquire a certification or ingredient evidence", () => {
  assert.deepEqual(classifyReligiousTags({ foodName: "Grilled Chicken", ingredients: [] }), {
    religiousTags: [], religiousTagReasons: {},
  });
});
