"use client";

import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import {
  countMenuFoods,
  getVisibleMenuCategories,
} from "@/lib/dining/menu-filtering";
import type { MenuItemCountProps } from "./types";

export function MenuItemCount({ categories }: MenuItemCountProps) {
  const settings = useDietaryPreferences();
  const total = countMenuFoods(categories);
  const visible = countMenuFoods(
    getVisibleMenuCategories(categories, settings),
  );

  return (
    <p className="w-fit shrink-0 text-[11px] font-medium text-muted">
      {visible === total ? total : `${visible} of ${total}`}{" "}
      {total === 1 ? "item" : "items"}
    </p>
  );
}
