import type { DiningHallAvailability, DiningMenu } from "../../types/dining.ts";

export function getMenuAvailability(
  menu: DiningMenu | null,
): DiningHallAvailability {
  if (menu === null) {
    return "unknown";
  }

  return Object.keys(menu).length === 0 ? "empty" : "available";
}
