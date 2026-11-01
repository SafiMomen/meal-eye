import clsx from "clsx";

import { DiningHallMenuContent } from "./menu-content";
import { MenuMessage } from "./menu-message";
import { MotionSurface } from "@/components/motion/motion-surface";
import { getDiningHalls } from "@/services/dining/get-dining-halls";
import { getMenu } from "@/services/dining/get-menu";
import { findMenuPeriod } from "@/lib/dining/menu-periods";
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
  itemCount: clsx("w-fit shrink-0", "text-[11px] font-medium text-muted"),
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
  const selectedHall = diningHalls?.find(
    (hall) => hall.name === selectedHallName,
  );

  if (!selectedHall) {
    return (
      <MenuMessage
        title="Dining hall not found"
        description="Choose another location from the dining hall list."
      />
    );
  }

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
        description={`${selectedHall.name} has not listed this meal period today.`}
      />
    );
  }

  const [, categories] = selectedPeriod;
  const itemCount = Object.values(categories).reduce(
    (total, foods) => total + foods.length,
    0,
  );

  return (
    <MotionSurface className="min-w-0" delay={MENU_ENTER_DELAY}>
      <section className={styles.panel} aria-labelledby="selected-hall-heading">
        <header className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>{selectedMeal} menu</p>
            <h2 id="selected-hall-heading" className={styles.heading}>
              {selectedHall.name}
            </h2>
          </div>
          <p className={styles.itemCount}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
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
