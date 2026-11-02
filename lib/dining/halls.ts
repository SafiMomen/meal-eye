import type { DiningHall } from "../../types/dining.ts";

const COMBINED_MATHEY_LABEL = "Rocky & Mathey";
const ROCKEFELLER_SOURCE_NAMES = new Set(["rockefeller", "rocky"]);
const MATHEY_SELECTION_ALIASES = new Set([
  "mathey",
  "rockefeller",
  "rocky",
  "rocky & mathey",
  "rockefeller & mathey",
]);

function normalizeHallName(name: string): string {
  return name
    .replace(/\bcolleges?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Keep source names and URLs intact; Mathey supplies the shared menu. */
export function getDiningHallMenuSources(
  halls: readonly DiningHall[],
): DiningHall[] {
  return halls.filter(
    (hall) => !ROCKEFELLER_SOURCE_NAMES.has(normalizeHallName(hall.name)),
  );
}

/** Resolve old Rocky links and the combined label to Mathey's source record. */
export function findDiningHall(
  halls: readonly DiningHall[],
  requestedName: string | undefined,
): DiningHall | undefined {
  if (!requestedName) {
    return undefined;
  }

  const requestedHall = normalizeHallName(requestedName);
  const sourceName = MATHEY_SELECTION_ALIASES.has(requestedHall)
    ? "mathey"
    : requestedHall;

  return halls.find((hall) => normalizeHallName(hall.name) === sourceName);
}

export function getDiningHallDisplayName(sourceName: string): string {
  return normalizeHallName(sourceName) === "mathey"
    ? COMBINED_MATHEY_LABEL
    : sourceName;
}

export function getDiningHallSidebarLabel(sourceName: string): string {
  return getDiningHallDisplayName(sourceName)
    .replace(/\bcolleges?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
