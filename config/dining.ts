import "server-only";

export const DINING_CONFIG = {
  locationsUrl: "https://menus.princeton.edu/dining/_Foodpro/online-menu/",
  requestHeaders: {
    "User-Agent": "MealEye/1.0 (educational dining information project)",
    Accept: "text/html,application/xhtml+xml",
  },
  // Next.js cache lifetimes are expressed in seconds.
  cacheLife: { stale: 60, revalidate: 60, expire: 300 },
} as const;
