import { load } from "cheerio";

import type { DiningHall } from "../../types/dining.ts";

export function parseDiningLocations(
  html: string,
  baseUrl: string,
): DiningHall[] {
  const document = load(html);

  return document("#residential > li.residential")
    .map((_, locationElement): DiningHall => {
      const locationLink = document(locationElement).find("a");
      const name = locationLink.text().trim();
      const relativePath = locationLink.attr("href");
      const link = relativePath
        ? new URL(relativePath, baseUrl).toString()
        : undefined;

      return { name, link };
    })
    .get()
    .filter((location) => location.name.length > 0);
}
