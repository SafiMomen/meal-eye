import { Suspense } from "react";
import { io } from "next/cache";

import { DiningHallMenu } from "./hall-menu";
import { DiningHallStatusList } from "./hall-status-list";
import { MealPeriodToggle } from "./meal-period-toggle";
import { FitnessTools } from "@/components/fitness/fitness-tools";
import clsx from "clsx";
import { LoadingMessage } from "./loading-message";
import {
  getMealPeriods,
  createDiningHref,
  readSearchParam,
  resolveMealPeriod,
} from "@/lib/dining/meal-periods";
import { isPrincetonWeekend } from "@/lib/dining/calendar";
import { findDiningHall } from "@/lib/dining/halls";
import { getDiningHalls } from "@/services/dining/get-dining-halls";
import { getMenu } from "@/services/dining/get-menu";
import type { DiningWorkspaceProps } from "./types";

export async function DiningWorkspace({ searchParams }: DiningWorkspaceProps) {
  const resolvedSearchParams = await searchParams;

  // The service schedule follows the current Princeton day, not build time.
  await io();
  const isWeekend = isPrincetonWeekend(new Date());

  const requestedHallName = readSearchParam(resolvedSearchParams.hall);
  const diningHalls = requestedHallName
    ? await getDiningHalls().catch(() => null)
    : null;
  const selectedHall = findDiningHall(diningHalls ?? [], requestedHallName);
  const selectedHallName = selectedHall?.name ?? requestedHallName;
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
        <div
          className={clsx(
            "mb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3",
            "sm:mb-6 sm:justify-between",
          )}
        >
          <MealPeriodToggle
            selectedHallName={selectedHallName}
            selectedMeal={selectedMeal}
            mealPeriods={mealPeriods}
          />
          <FitnessTools
            diningQuery={createDiningHref(selectedMeal, selectedHallName).query}
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
