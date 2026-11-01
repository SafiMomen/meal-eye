import { Suspense } from "react";
import { io } from "next/cache";

import { DiningHallMenu } from "./hall-menu";
import { DiningHallStatusList } from "./hall-status-list";
import { MealPeriodToggle } from "./meal-period-toggle";
import { LoadingMessage } from "./loading-message";
import {
  getMealPeriods,
  readSearchParam,
  resolveMealPeriod,
} from "@/lib/dining/meal-periods";
import { isPrincetonWeekend } from "@/lib/dining/calendar";
import { getDiningHalls } from "@/services/dining/get-dining-halls";
import { getMenu } from "@/services/dining/get-menu";
import type { DiningWorkspaceProps } from "./types";

export async function DiningWorkspace({ searchParams }: DiningWorkspaceProps) {
  const resolvedSearchParams = await searchParams;

  // The service schedule follows the current Princeton day, not build time.
  await io();
  const isWeekend = isPrincetonWeekend(new Date());

  const selectedHallName = readSearchParam(resolvedSearchParams.hall);
  const diningHalls = selectedHallName
    ? await getDiningHalls().catch(() => null)
    : null;
  const selectedHall = diningHalls?.find(
    (hall) => hall.name === selectedHallName,
  );
  const menu = selectedHall
    ? await getMenu(selectedHall).catch(() => null)
    : null;
  const mealPeriods = getMealPeriods(isWeekend, menu);
  const selectedMeal = resolveMealPeriod(
    readSearchParam(resolvedSearchParams.meal),
    isWeekend,
    menu,
  );

  return (
    <div className="min-h-screen w-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-5 sm:mb-6">
          <MealPeriodToggle
            selectedHallName={selectedHallName}
            selectedMeal={selectedMeal}
            mealPeriods={mealPeriods}
          />
        </div>

        <main className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-6">
          <Suspense
            fallback={<LoadingMessage>Loading dining halls...</LoadingMessage>}
          >
            <DiningHallStatusList
              selectedHallName={selectedHallName}
              selectedMeal={selectedMeal}
              isWeekend={isWeekend}
            />
          </Suspense>

          <Suspense fallback={<LoadingMessage>Loading menu...</LoadingMessage>}>
            <DiningHallMenu
              selectedHallName={selectedHallName}
              selectedMeal={selectedMeal}
              isWeekend={isWeekend}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
