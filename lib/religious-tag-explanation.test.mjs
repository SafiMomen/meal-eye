import assert from "node:assert/strict";
import { test } from "node:test";

import { getReligiousTagExplanation } from "./religious-tag-explanation.ts";
import { classifyReligiousTags } from "./religious-tags.ts";

const text = (parts) => parts.map((part) => part.text).join("");
const highlights = (parts) => parts.filter((part) => part.highlighted).map((part) => part.text);
const ingredient = (name, category) => ({ source: "ingredient", text: name, category });

test("Halal ingredients share one sentence with individually highlighted names", () => {
  const parts = getReligiousTagExplanation("Halal", [
    ingredient("Halal Chicken Breast"), ingredient("Halal Chicken Thigh"),
  ]);
  assert.equal(text(parts), "This food contains Halal Chicken Breast and Halal Chicken Thigh, which the menu explicitly identifies as Halal.");
  assert.deepEqual(highlights(parts), ["Halal Chicken Breast", "Halal Chicken Thigh"]);
});

test("multiple Haram ingredients retain their names and causes in one sentence", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: ["Pork Bacon", "Red Wine Vinegar"] });
  const parts = getReligiousTagExplanation("Haram", result.religiousTagReasons.Haram);
  assert.deepEqual(highlights(parts), ["Pork Bacon", "Red Wine Vinegar"]);
  assert.equal(text(parts), "This food contains Pork Bacon and Red Wine Vinegar, which the app flags as Haram for pork and alcohol references.");
});

test("Non-Kosher uses the same compact sentence without implying alcohol is Non-Kosher", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: ["Pork Bacon", "White Wine"] });
  const parts = getReligiousTagExplanation("Non-Kosher", result.religiousTagReasons["Non-Kosher"]);
  assert.deepEqual(highlights(parts), ["Pork Bacon"]);
  assert.equal(text(parts), "This food contains Pork Bacon, which the app flags as Non-Kosher for pork references.");
});

test("duplicate names and redundant food-name clues are omitted", () => {
  const result = classifyReligiousTags({ foodName: "Halal Chicken", ingredients: ["Halal Chicken Breast", "HALAL CHICKEN BREAST", "Halal Chicken Thigh"] });
  const parts = getReligiousTagExplanation("Halal", result.religiousTagReasons.Halal);
  assert.deepEqual(highlights(parts), ["Halal Chicken Breast", "Halal Chicken Thigh"]);
  assert.equal(text(parts).includes("food name"), false);
});

test("three or more ingredients get natural inline punctuation", () => {
  const parts = getReligiousTagExplanation("Halal", [
    ingredient("Halal Chicken"), ingredient("Halal Beef"), ingredient("Halal Lamb"),
  ]);
  assert.match(text(parts), /Halal Chicken, Halal Beef, and Halal Lamb/);
  assert.equal(highlights(parts).length, 3);
});

test("food-name evidence does not invent an ingredient entry", () => {
  const result = classifyReligiousTags({ foodName: "Bacon Soup", ingredients: [] });
  const parts = getReligiousTagExplanation("Haram", result.religiousTagReasons.Haram);
  assert.equal(text(parts), "The food name mentions bacon, which triggered the Haram flag.");
  assert.deepEqual(highlights(parts), ["bacon"]);
});

test("menu labels remain distinct from ingredient evidence", () => {
  const parts = getReligiousTagExplanation("Non-Kosher", [{ source: "menu-label", text: "Non-Kosher" }]);
  assert.equal(text(parts), "The menu labels this food Non-Kosher, which triggered the Non-Kosher flag.");
  assert.deepEqual(highlights(parts), ["Non-Kosher"]);
});

test("CJL remains a location rule, not an ingredient claim", () => {
  const parts = getReligiousTagExplanation("Kosher", [{ source: "location", text: "Center for Jewish Life (CJL)" }]);
  assert.equal(text(parts), "This food is served at Center for Jewish Life (CJL), which the app treats as Kosher.");
});

test("unknown Halal preserves the ask-first warning without invented evidence", () => {
  const parts = getReligiousTagExplanation("Halal?", []);
  assert.match(text(parts), /better to ask/);
  assert.deepEqual(highlights(parts), []);
});

test("missing evidence remains explicit", () => {
  assert.match(text(getReligiousTagExplanation("Haram", [])), /no specific ingredient/);
  const parts = getReligiousTagExplanation("Haram", [{ source: "unspecified", text: "No ingredient", foodName: "An entrée" }]);
  assert.equal(text(parts), "The menu marks An entrée Haram but provides no specific ingredient.");
});

test("hall sentences preserve which food contains each ingredient", () => {
  const parts = getReligiousTagExplanation("Haram", [
    { ...ingredient("Pork", "pork"), foodName: "Sweet & Sour Pork" },
    { ...ingredient("Wine Vinegar", "alcohol"), foodName: "Sweet & Sour Tofu" },
  ]);
  assert.equal(text(parts), "Sweet & Sour Pork contains Pork, which the app flags as Haram for pork references; Sweet & Sour Tofu contains Wine Vinegar, which the app flags as Haram for alcohol references.");
});

test("a keyword in a menu label is not presented as an explicit classification", () => {
  const result = classifyReligiousTags({ foodName: "Food", ingredients: [], explicitTagText: "Wine sauce" });
  const parts = getReligiousTagExplanation("Haram", result.religiousTagReasons.Haram);
  assert.equal(text(parts).includes("explicitly"), false);
  assert.match(text(parts), /triggered the Haram flag/);
});

test("building a sentence does not mutate ingredient evidence", () => {
  const reasons = Object.freeze([Object.freeze(ingredient("Halal Chicken"))]);
  getReligiousTagExplanation("Halal", reasons);
  assert.equal(reasons[0].text, "Halal Chicken");
});
