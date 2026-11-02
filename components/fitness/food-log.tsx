"use client";

import { AnimatePresence } from "framer-motion";
import { useFitness } from "@/hooks/use-fitness";
import { FoodLogRow } from "./food-log-row";
import { CalorieBalance } from "./calorie-balance";

export function FoodLog() {
  const { today, entries } = useFitness();

  return (
    <>
      <div className="pb-5">
        <p className="mb-2 text-[11px] text-muted">
          {today || "Today"} · Princeton time · portions use the menu’s serving
          size
        </p>
        {entries.length === 0 ? (
          <p className="py-8 text-sm leading-6 text-muted">
            Add food using the + on a menu card. Adjust portions here as you
            eat.
          </p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <FoodLogRow key={entry.id} entry={entry} index={index} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <CalorieBalance />
    </>
  );
}
