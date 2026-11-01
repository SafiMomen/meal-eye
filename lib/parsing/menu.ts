import { load } from "cheerio";

import { extractMenuFood } from "./food.ts";
import { normalizeWhitespace } from "./text.ts";
import type { DiningMenu, MenuCategories } from "../../types/dining.ts";
import type { HtmlElement } from "../../types/parsing.ts";

function extractMenuCategories(
  periodContainer: HtmlElement,
  diningHallName: string,
): MenuCategories {
  const periodChildren = periodContainer.children();
  const categories: MenuCategories = {};
  let currentCategoryName: string | undefined;

  periodChildren.each((childIndex) => {
    const childElement = periodChildren.eq(childIndex);

    if (childElement.hasClass("mealStation")) {
      currentCategoryName = childElement.text().trim();
      categories[currentCategoryName] = [];
      return;
    }

    if (!currentCategoryName || !childElement.hasClass("accordion-item")) {
      return;
    }

    const food = extractMenuFood(childElement, diningHallName);
    if (food) {
      categories[currentCategoryName].push(food);
    }
  });

  return Object.fromEntries(
    Object.entries(categories).filter(([, foods]) => foods.length > 0),
  );
}

export function parseDiningMenu(
  html: string,
  diningHallName: string,
): DiningMenu {
  const document = load(html);
  const menu: DiningMenu = {};

  if (document("#noData").length > 0) {
    return menu;
  }

  document(".card.mealCard").each((_, mealElement) => {
    const mealContainer = document(mealElement);
    const periodHeader = mealContainer.find(".card-header").first().clone();
    periodHeader.find(".float-end, a").remove();
    const periodName = normalizeWhitespace(periodHeader.text());

    if (!periodName) {
      return;
    }

    const periodContainer = mealContainer.find(
      '.card-body [id^="mealAccordian-"]',
    );
    const categories = extractMenuCategories(periodContainer, diningHallName);

    if (Object.keys(categories).length > 0) {
      menu[periodName] = categories;
    }
  });

  return menu;
}
