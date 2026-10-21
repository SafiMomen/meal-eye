import { DiningHallMenuContent } from "@/components/dining-hall-menu-content";
import { MotionSurface } from "@/components/motion-surface";
import type { MealPeriod } from "@/lib/dining-page";
import { getDiningHalls } from "@/services/getDiningHall";
import { getMenu } from "@/services/getMenu";
import clsx from "clsx";

type DiningHallMenuProps = {
  selectedHallName?: string;
  selectedMeal: MealPeriod;
};

const styles = {
  panel: clsx(
    "min-w-0 overflow-hidden",
    "rounded-sm border border-line/70 bg-surface",
    "text-foreground",
  ),
  message: clsx(
    "flex min-h-48 flex-col items-center justify-center gap-1.5",
    "px-5 py-10",
    "rounded-sm border border-line/70 bg-surface",
    "text-center text-sm text-muted",
  ),
  messageTitle: "font-semibold text-foreground",
  panelHeader: clsx(
    "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
    "px-4 py-4 sm:px-6 sm:py-5",
    "border-b border-line/70",
  ),
  eyebrow: clsx(
    "text-[10px] font-bold uppercase tracking-[0.16em] text-accent",
  ),
  heading: clsx("mt-1", "text-xl font-bold tracking-tight text-foreground"),
  itemCount: clsx(
    "w-fit shrink-0",
    "text-[11px] font-medium text-muted",
  ),
};

export async function DiningHallMenu({
  selectedHallName,
  selectedMeal,
}: DiningHallMenuProps) {
  if (!selectedHallName) {
    return (
      <MotionSurface className={styles.message}>
        <p className={styles.messageTitle}>No dining hall selected</p>
        <p>
          Choose a dining hall to view its {selectedMeal.toLowerCase()} menu.
        </p>
      </MotionSurface>
    );
  }

  const diningHalls = await getDiningHalls().catch(() => null);
  const selectedHall = diningHalls?.find(
    (hall) => hall.name === selectedHallName,
  );

  if (!selectedHall) {
    return (
      <MotionSurface className={styles.message}>
        <p className={styles.messageTitle}>Dining hall not found</p>
        <p>Choose another location from the dining hall list.</p>
      </MotionSurface>
    );
  }

  const menu = await getMenu(selectedHall).catch((error: unknown) => {
    console.error(`Failed to load the menu for ${selectedHall.name}.`, error);
    return null;
  });

  if (!menu) {
    return (
      <MotionSurface className={styles.message}>
        <p className={styles.messageTitle}>Menu unavailable</p>
        <p>The dining menu could not be loaded right now.</p>
      </MotionSurface>
    );
  }

  const selectedPeriod = Object.entries(menu).find(
    ([periodName]) => periodName.toLowerCase() === selectedMeal.toLowerCase(),
  );

  if (!selectedPeriod) {
    return (
      <MotionSurface className={styles.message}>
        <p className={styles.messageTitle}>No {selectedMeal.toLowerCase()} menu</p>
        <p>{selectedHall.name} has not listed this meal period today.</p>
      </MotionSurface>
    );
  }

  const [periodName, categories] = selectedPeriod;
  const itemCount = Object.values(categories).reduce(
    (total, foods) => total + foods.length,
    0,
  );

  return (
    <MotionSurface className="min-w-0" delay={0.08}>
      <section className={styles.panel} aria-labelledby="selected-hall-heading">
        <header className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>{periodName} menu</p>
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
          periodName={periodName}
          categories={categories}
        />
      </section>
    </MotionSurface>
  );
}
