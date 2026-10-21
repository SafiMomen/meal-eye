import "server-only";
import * as Cheerio from "cheerio";
import { cacheLife } from "next/cache";

import { DINING_CONFIG } from "@/config/dining";

import { DiningHallElement } from "@/lib/dining-types";
/* 
    Uses web scraping to get the dining hall menu
    from the official Princeton website.
*/
export async function getDiningHalls(): Promise<DiningHallElement[]> {
    "use cache";
    cacheLife({ stale: 60, revalidate: 60, expire: 300 });

    /* 
        TODO: if the dining hall is not open, somehow return that.

        Often times the user might not want certain dining hall.
    */
    const response = await fetch(DINING_CONFIG.locationsUrl, {
        headers: {
            "User-Agent": "MealEye/1.0 (educational dining information project)",
            "Accept": "text/html,application/xhtml+xml",
        }, // these headers might be useful to not block the web-scraping.
    });

    if (!response.ok) {
        throw new Error("failed to fetch dining hall locations");
    }

    const html = await response.text();
    const $ = Cheerio.load(html);

    const locations = $("#residential > li.residential")
        .map((_, element) => {
            const location = $(element);

            const linkTag = location.find("a");
            const locationName = linkTag.text().trim();
            /* 
                This might cause problems if future they decide to remove the link.
                Could be useful for getting information on the specific dining hall.
            */
            const locationPath = linkTag.attr('href');
            const locationLink = locationPath
                ? new URL(locationPath, DINING_CONFIG.locationsUrl).toString()
                : undefined;

            const diningHallElement: DiningHallElement = { 
                name: locationName,
                link: locationLink
            };
            return diningHallElement;

        }).get().filter((location) => {
            return (location.name.length > 0);
        }) as DiningHallElement[]; 

    return locations;
}
