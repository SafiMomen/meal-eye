import clsx from "clsx";

import { DiningHallMenuContent } from "./menu-content";
import { MenuItemCount } from "./menu-item-count";
import { MenuMessage } from "./menu-message";
import { MotionSurface } from "@/components/motion/motion-surface";
import { getDiningHalls } from "@/services/dining/get-dining-halls";
import { getMenu } from "@/services/dining/get-menu";
import { findMenuPeriod } from "@/lib/dining/menu-periods";
import { findDiningHall, getDiningHallDisplayName } from "@/lib/dining/halls";
import type { DiningSelection } from "@/types/dining";

const MENU_ENTER_DELAY = 0.08;

const styles = {
  panel: clsx(
    "min-w-0 overflow-hidden",
    "rounded-sm border border-line/70 bg-surface",
    "text-foreground",
  ),
  panelHeader: clsx(
    "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
    "px-4 py-4 sm:px-6 sm:py-5",
    "border-b border-line/70",
  ),
  eyebrow: clsx(
    "text-[10px] font-bold uppercase tracking-[0.16em] text-accent",
  ),
  heading: clsx("mt-1", "text-xl font-bold tracking-tight text-foreground"),
};

export async function DiningHallMenu({
  selectedHallName,
  selectedMeal,
  isWeekend,
}: DiningSelection) {
  const mealLabel = selectedMeal.toLowerCase();

  if (!selectedHallName) {
    return (
      <MenuMessage
        title="No dining hall selected"
        description={`Choose a dining hall to view its ${mealLabel} menu.`}
      />
    );
  }

  const diningHalls = await getDiningHalls().catch(() => null);
  const selectedHall = findDiningHall(diningHalls ?? [], selectedHallName);

  if (!selectedHall) {
    return (
      <MenuMessage
        title="Dining hall not found"
        description="Choose another location from the dining hall list."
      />
    );
  }

  const displayName = getDiningHallDisplayName(selectedHall.name);
  const menu = await getMenu(selectedHall).catch((error: unknown) => {
    console.error(`Failed to load the menu for ${selectedHall.name}.`, error);
    return null;
  });

  if (!menu) {
    return (
      <MenuMessage
        title="Menu unavailable"
        description="The dining menu could not be loaded right now."
      />
    );
  }

  const selectedPeriod = findMenuPeriod(menu, selectedMeal, isWeekend);

  if (!selectedPeriod) {
    return (
      <MenuMessage
        title={`No ${mealLabel} menu`}
        description={`${displayName} has not listed this meal period today.`}
      />
    );
  }

  const [, categories] = selectedPeriod;

  return (
    <MotionSurface className="min-w-0" delay={MENU_ENTER_DELAY}>
      <section className={styles.panel} aria-labelledby="selected-hall-heading">
        <header className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>{selectedMeal} menu</p>
            <h2 id="selected-hall-heading" className={styles.heading}>
              {displayName}
            </h2>
          </div>
          <MenuItemCount categories={categories} />
        </header>
        <DiningHallMenuContent
          hallName={selectedHall.name}
          periodName={selectedMeal}
          categories={categories}
        />
      </section>
    </MotionSurface>
  );
}
