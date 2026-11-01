import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "cheerio";

import { extractMenuFood } from "../../lib/parsing/food.ts";
import { parseDiningMenu } from "../../lib/parsing/menu.ts";
import { parseDiningLocations } from "../../lib/parsing/locations.ts";

function foodMarkup(name, nutrition = "", tag = "") {
  return `
    <div class="accordion-item">
      <div class="accordion-header"><span class="title">${name}</span></div>
      <div class="nutritionFact">${nutrition}</div>
      ${tag}
    </div>
  `;
}

function mealMarkup(period, contents) {
  return `
    <section class="card mealCard">
      <header class="card-header">
        ${period}<span class="float-end">Hours</span><a>Print</a>
      </header>
      <div class="card-body">
        <div id="mealAccordian-test">${contents}</div>
      </div>
    </section>
  `;
}

function parseFood(markup, hallName = "Test Hall") {
  const document = load(markup);
  return extractMenuFood(document(".accordion-item"), hallName);
}

test("food parsing preserves every nutrition field and classification evidence", () => {
  const food = parseFood(
    foodMarkup(
      "Chicken",
      [
        "Calories: 125",
        "Protein: 20g",
        "Cholesterol: 30mg",
        "Total Fat: 4g",
        "Saturated Fat: 1g",
        "Trans Fat: 0g",
        "Total Carbohydrates: 10g",
        "Dietary Fiber: 2g",
        "Sugars: 3g",
        "Sodium: 200mg",
        "Serving Size: 1 bowl",
        "Ingredients: Halal Chicken, salt",
        "Allergens: Soy, Wheat",
      ].join("<br>"),
    ),
  );

  assert.equal(food.foodName, "Chicken");
  assert.deepEqual(
    [
      food.calories,
      food.proteinGrams,
      food.cholesterolMilligrams,
      food.totalFatGrams,
      food.saturatedFatGrams,
      food.transFatGrams,
      food.totalCarbohydratesGrams,
      food.dietaryFiberGrams,
      food.sugarsGrams,
      food.sodiumMilligrams,
    ],
    [125, 20, 30, 4, 1, 0, 10, 2, 3, 200],
  );
  assert.equal(food.servingSize, "1 bowl");
  assert.deepEqual(food.ingredients, ["Halal Chicken", "salt"]);
  assert.deepEqual(food.allergens, ["Soy", "Wheat"]);
  assert.deepEqual(food.religiousTags, ["Halal"]);
  assert.equal(food.religiousTagReasons.Halal[0].text, "Halal Chicken");
});

test("food with no nutrition or no name is excluded", () => {
  assert.equal(parseFood(foodMarkup("No facts")), null);
  assert.equal(parseFood(foodMarkup("", "Calories: 100")), null);
  assert.equal(parseFood(foodMarkup("No numbers", "Ingredients: salt")), null);
});

test("zero nutrition is valid and missing nutrients remain null", () => {
  const food = parseFood(foodMarkup("Water", "Calories: 0"));
  assert.equal(food.calories, 0);
  assert.equal(food.proteinGrams, null);
  assert.equal(food.servingSize, null);
});

test("explicit tags and CJL location rules survive parsing", () => {
  const markup = foodMarkup(
    "Chicken",
    "Calories: 10",
    '<span data-religious-tag="Halal"></span>',
  );
  const food = parseFood(markup, "Center for Jewish Life");
  assert.deepEqual(food.religiousTags, ["Halal", "Kosher"]);
});

test("menus preserve brunch, prune empty categories, and skip orphan foods", () => {
  const html =
    mealMarkup(
      "Brunch",
      `
    ${foodMarkup("Orphan", "Calories: 5")}
    <h3 class="mealStation">Entree</h3>
    ${foodMarkup("Roast Pork", "Calories: 100<br>Ingredients: Pork")}
    ${foodMarkup("No facts")}
    <h3 class="mealStation">Empty</h3>
    ${foodMarkup("No facts")}
  `,
    ) + mealMarkup("Dinner", '<h3 class="mealStation">Empty</h3>');
  const menu = parseDiningMenu(html, "Test Hall");

  assert.deepEqual(Object.keys(menu), ["Brunch"]);
  assert.deepEqual(Object.keys(menu.Brunch), ["Entree"]);
  assert.equal(menu.Brunch.Entree.length, 1);
  assert.deepEqual(menu.Brunch.Entree[0].religiousTags, [
    "Haram",
    "Non-Kosher",
  ]);
});

test("unavailable and empty menus remain empty", () => {
  assert.deepEqual(
    parseDiningMenu('<div id="noData">Unavailable</div>', "Hall"),
    {},
  );
  assert.deepEqual(parseDiningMenu("", "Hall"), {});
});

test("locations resolve relative URLs and ignore unnamed links", () => {
  const html = `
    <ul id="residential">
      <li class="residential"><a href="hall.html"> Test Hall </a></li>
      <li class="residential"><a>Missing URL</a></li>
      <li class="residential"><a href="empty.html"> </a></li>
    </ul>
  `;

  assert.deepEqual(parseDiningLocations(html, "https://example.test/menus/"), [
    { name: "Test Hall", link: "https://example.test/menus/hall.html" },
    { name: "Missing URL", link: undefined },
  ]);
});
