import { getDiningHalls } from "@/services/getDiningHall";
import { getMenu } from "@/services/getMenu";
import { DietaryPreferences } from "@/components/dietary-preferences";
import {
  DiningHallSelectionList,
  DiningHallSelectionRow,
} from "@/components/dining-hall-selection";
import { MotionSurface } from "@/components/motion-surface";
import { hasHaramEntree } from "@/lib/dining-hall-tags";
import type { MealPeriod } from "@/lib/dining-page";
import type { DiningHallElement } from "@/lib/dining-types";
import clsx from "clsx";
import { Suspense } from "react";

type DiningHallStatusListProps = {
  selectedHallName?: string;
  selectedMeal: MealPeriod;
};

const styles = {
  navigation: clsx("w-full", "text-foreground"),
  header: "px-2.5 pb-1.5",
  heading: clsx(
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted",
  ),
  unavailable: clsx("px-2.5 py-3", "text-xs text-muted"),
};

async function DiningHallMenuRow({
  hall,
  selectedMeal,
  isSelected,
}: {
  hall: DiningHallElement;
  selectedMeal: MealPeriod;
  isSelected: boolean;
}) {
  const menu = hall.link ? await getMenu(hall).catch(() => null) : {};
  const availability =
    menu === null
      ? "unknown"
      : Object.keys(menu).length === 0
        ? "empty"
        : "available";

  return (
    <DiningHallSelectionRow
      hallName={hall.name}
      selectedMeal={selectedMeal}
      isSelected={isSelected}
      availability={availability}
      hasHaramEntree={menu !== null && hasHaramEntree(menu, selectedMeal)}
    />
  );
}

export async function DiningHallStatusList({
  selectedHallName,
  selectedMeal,
}: DiningHallStatusListProps) {
  const diningHalls = await getDiningHalls().catch(() => null);

  return (
    <MotionSurface className="lg:sticky lg:top-6" delay={0.04}>
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
                  />
                </Suspense>
              );
            })}
          </DiningHallSelectionList>
        )}
      </nav>
      <DietaryPreferences />
    </MotionSurface>
  );
}
