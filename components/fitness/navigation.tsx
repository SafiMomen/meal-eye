"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { selectionStyles } from "@/components/ui/selection-styles";
import { FitnessTools } from "./fitness-tools";

export function FitnessNavigation() {
  const searchParams = useSearchParams();
  const diningQuery = {
    hall: searchParams.get("hall") ?? undefined,
    meal: searchParams.get("meal") ?? undefined,
  };

  return (
    <header
      className={clsx(
        "mb-8 flex flex-wrap items-center justify-between gap-3 pb-3",
        "border-b border-line/60",
      )}
    >
      <Link
        href={{ pathname: "/", query: diningQuery }}
        className={clsx(selectionStyles.option, selectionStyles.idle)}
      >
        Menus
      </Link>
      <FitnessTools diningQuery={diningQuery} />
    </header>
  );
}
