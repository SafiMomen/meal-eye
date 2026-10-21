import { DiningHallMenu } from "@/components/dining-hall-menu";
import { DiningHallStatusList } from "@/components/dining-hall-status-list";
import { MealPeriodToggle } from "@/components/meal-period-toggle";
import {
  type DiningPageSearchParams,
  readSearchParam,
  resolveMealPeriod,
} from "@/lib/dining-page";

import { Suspense } from "react";

type HomeProps = {
  searchParams: Promise<DiningPageSearchParams>;
};

const loadingStyles =
  "flex min-h-40 items-center justify-center rounded-sm border border-line/70 bg-surface px-5 py-8 text-sm text-muted";

function DiningWorkspaceFallback() {
  return (
    <div className="min-h-screen w-full bg-background px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <p className={`${loadingStyles} mx-auto max-w-[90rem]`}>Loading menus...</p>
    </div>
  );
}

async function DiningWorkspace({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const selectedHallName = readSearchParam(resolvedSearchParams.hall);
  const selectedMeal = resolveMealPeriod(
    readSearchParam(resolvedSearchParams.meal),
  );

  return (
    <div className="min-h-screen w-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-5 sm:mb-6">
          <MealPeriodToggle
            selectedHallName={selectedHallName}
            selectedMeal={selectedMeal}
          />
        </div>

        <main className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-6">
          <Suspense
            fallback={<p className={loadingStyles}>Loading dining halls...</p>}
          >
            <DiningHallStatusList
              selectedHallName={selectedHallName}
              selectedMeal={selectedMeal}
            />
          </Suspense>

          <Suspense fallback={<p className={loadingStyles}>Loading menu...</p>}>
            <DiningHallMenu
              selectedHallName={selectedHallName}
              selectedMeal={selectedMeal}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <Suspense fallback={<DiningWorkspaceFallback />}>
      <DiningWorkspace searchParams={searchParams} />
    </Suspense>
  );
}
