import "server-only";
import { cacheLife } from "next/cache";

import { DINING_CONFIG } from "@/config/dining";
import { parseDiningLocations } from "@/lib/parsing/locations";
import { getDiningHallMenuSources } from "@/lib/dining/halls";
import { fetchDiningPage } from "./fetch-page";
import type { DiningHall } from "@/types/dining";

export async function getDiningHalls(): Promise<DiningHall[]> {
  "use cache";
  cacheLife(DINING_CONFIG.cacheLife);

  const html = await fetchDiningPage(
    DINING_CONFIG.locationsUrl,
    "failed to fetch dining hall locations",
  );

  return getDiningHallMenuSources(
    parseDiningLocations(html, DINING_CONFIG.locationsUrl),
  );
}
