import { Suspense } from "react";
import clsx from "clsx";

import { getDiningHalls } from "@/services/dining/get-dining-halls";
import { DietaryPreferences } from "@/components/dietary/preferences-controls";
import { RestrictionControls } from "@/components/dietary/restriction-controls";
import { MealFilterControls } from "@/components/dietary/meal-filter-controls";
import { MotionSurface } from "@/components/motion/motion-surface";
import { DiningHallSelectionList } from "./hall-selection-list";
import { DiningHallSelectionRow } from "./hall-selection-row";
import { DiningHallMenuRow } from "./hall-menu-row";
import type { DiningSelection } from "@/types/dining";

const SIDEBAR_ENTER_DELAY = 0.04;

const styles = {
  navigation: clsx("w-full", "text-foreground"),
  header: "px-2.5 pb-1.5",
  heading: clsx(
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted",
  ),
  unavailable: clsx("px-2.5 py-3", "text-xs text-muted"),
};

export async function DiningHallStatusList({
  selectedHallName,
  selectedMeal,
  isWeekend,
}: DiningSelection) {
  const diningHalls = await getDiningHalls().catch(() => null);

  return (
    <MotionSurface className="lg:sticky lg:top-6" delay={SIDEBAR_ENTER_DELAY}>
      <nav
        className={styles.navigation}
        aria-labelledby="dining-hall-status-heading"
      >
        <header className={styles.header}>
          <h2 id="dining-hall-status-heading" className={styles.heading}>
            Dining halls
          </h2>
        </header>

        {!diningHalls ? (
          <p className={styles.unavailable}>Status unavailable.</p>
        ) : diningHalls.length === 0 ? (
          <p className={styles.unavailable}>No dining halls found.</p>
        ) : (
          <DiningHallSelectionList>
            {diningHalls.map((hall) => {
              const isSelected = hall.name === selectedHallName;

              return (
                <Suspense
                  key={hall.name}
                  fallback={
                    <DiningHallSelectionRow
                      hallName={hall.name}
                      selectedMeal={selectedMeal}
                      isSelected={isSelected}
                      availability="unknown"
                    />
                  }
                >
                  <DiningHallMenuRow
                    hall={hall}
                    selectedMeal={selectedMeal}
                    isSelected={isSelected}
                    isWeekend={isWeekend}
                  />
                </Suspense>
              );
            })}
          </DiningHallSelectionList>
        )}
      </nav>
      <DietaryPreferences />
      <RestrictionControls />
      <MealFilterControls />
    </MotionSurface>
  );
}
