"use client";

import { m, useReducedMotion } from "framer-motion";
import { useFitness } from "@/hooks/use-fitness";
import { FITNESS_SPRING, FOOD_LOG_MOTION } from "@/lib/motion/constants";
import type { FitnessPageProps } from "./types";

export function FitnessPage({ title, children }: FitnessPageProps) {
  const reduceMotion = useReducedMotion();
  const { today } = useFitness();

  return (
    <m.main
      className="mx-auto w-full max-w-xl"
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: FOOD_LOG_MOTION.pageScale,
              y: FOOD_LOG_MOTION.pageOffset,
            }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : FITNESS_SPRING}
      aria-busy={!today}
    >
      <h1 className="mb-5 text-xl font-semibold">{title}</h1>
      {/* Mount editable fields after the browser restores its saved data. */}
      {today ? (
        children
      ) : (
        <p className="text-xs text-muted" role="status">
          Loading saved data...
        </p>
      )}
    </m.main>
  );
}
