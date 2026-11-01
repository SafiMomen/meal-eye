import "server-only";
import { cacheLife } from "next/cache";

import { DINING_CONFIG } from "@/config/dining";
import { parseDiningMenu } from "@/lib/parsing/menu";
import { fetchDiningPage } from "./fetch-page";
import type { DiningHall, DiningMenu } from "@/types/dining";

export async function getMenu(diningHall: DiningHall): Promise<DiningMenu> {
  "use cache";
  cacheLife(DINING_CONFIG.cacheLife);

  if (!diningHall.link) {
    throw new Error("cannot fetch dining hall with no link.");
  }

  const html = await fetchDiningPage(
    diningHall.link,
    "failed to fetch dining hall menu.",
  );

  return parseDiningMenu(html, diningHall.name);
}
