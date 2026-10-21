"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import clsx from "clsx";

import { ReligiousTagBadge } from "@/components/religious-tag-badge";
import type { ReligiousTag } from "@/lib/dining-types";

export type { ReligiousTag } from "@/lib/dining-types";

export type FoodNutritionCardProps = {
  foodName: string;
  calories: number | null;
  proteinGrams: number | null;
  cholesterolMilligrams: number | null;
  totalFatGrams: number | null;
  saturatedFatGrams: number | null;
  transFatGrams: number | null;
  totalCarbohydratesGrams: number | null;
  dietaryFiberGrams: number | null;
  sugarsGrams: number | null;
  sodiumMilligrams: number | null;
  religiousTags: ReligiousTag[];
};

function formatNutrient(value: number | null, unit = ""): string {
  return value === null ? "N/A" : `${value}${unit}`;
}

const styles = {
  card: clsx(
    "w-full overflow-hidden",
    "rounded-sm border border-line/80 bg-card",
    "text-foreground",
    "transition-colors duration-200 hover:border-muted/50",
  ),
  toggle: clsx(
    "grid h-[4.5rem] w-full grid-cols-[minmax(0,1fr)_1.25rem] grid-rows-[2rem_1rem] items-start gap-x-2 gap-y-1",
    "px-3 py-2.5",
    "cursor-pointer rounded-sm text-left",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
  ),
  foodName: clsx(
    "line-clamp-2 h-8 min-w-0",
    "text-[13px] font-semibold leading-4",
  ),
  summaryRow: clsx(
    "col-span-2 grid h-4 grid-cols-[minmax(0,1fr)_8.5rem] items-center gap-1",
  ),
  tagViewport: clsx("h-4 min-w-0 overflow-hidden"),
  collapsedTags: clsx("flex h-4 items-center gap-0.5"),
  summary: clsx("relative h-4 w-full"),
  metric: clsx("absolute inset-y-0 right-0 flex items-baseline gap-1"),
  metricLabel: clsx("text-[9px] font-medium leading-4 text-muted"),
  caloriesValue: clsx("text-sm font-bold leading-4 tabular-nums text-accent"),
  proteinViewport: clsx("absolute inset-y-0 right-0 w-16 overflow-hidden"),
  proteinSummary: clsx(
    "flex h-4 items-baseline justify-end gap-0.5",
    "border-l border-line pl-1.5",
  ),
  proteinLabel: clsx("text-[8px] font-medium leading-4 text-muted"),
  proteinValue: clsx("text-[11px] font-semibold leading-4 tabular-nums"),
  chevron: clsx(
    "flex size-5 shrink-0 items-center justify-center",
    "text-muted",
  ),
  expandedContent: "overflow-hidden",
  expandedInner: "px-3 pb-3 pt-1",
  nutrientGrid: clsx("grid grid-cols-6 grid-rows-2 gap-1.5"),
  macroPanel: clsx(
    "col-span-3 flex flex-col justify-center",
    "px-2 py-1",
    "rounded-[2px] bg-inset",
  ),
  macroHeader: clsx("flex items-baseline justify-between gap-2", "text-[11px]"),
  macroValue: clsx("font-semibold"),
  macroDetails: clsx(
    "flex justify-between gap-2",
    "mt-0.5",
    "text-[9px] text-muted",
  ),
  inlineDefinition: clsx("inline"),
  micronutrientGrid: clsx("col-span-6 grid grid-cols-3 gap-1.5", "text-center"),
  micronutrientPanel: clsx(
    "flex flex-col items-center justify-center",
    "px-1 py-1",
    "rounded-[2px] bg-inset",
  ),
  micronutrientLabel: clsx("text-[9px] text-muted"),
  micronutrientValue: clsx("text-xs", "font-semibold"),
  religiousSection: clsx("flex items-center gap-1.5", "mt-1.5"),
  religiousHeading: clsx("text-[9px] text-muted", "font-semibold"),
  tagList: clsx("flex flex-wrap gap-1"),
};

export function FoodNutritionCard({
  foodName,
  calories,
  proteinGrams,
  cholesterolMilligrams,
  totalFatGrams,
  saturatedFatGrams,
  transFatGrams,
  totalCarbohydratesGrams,
  dietaryFiberGrams,
  sugarsGrams,
  sodiumMilligrams,
  religiousTags,
}: FoodNutritionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const detailsId = `${reactId}-details`;
  const duration = prefersReducedMotion ? 0 : 0.3;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span id={titleId} className={styles.foodName} title={foodName}>
          {foodName}
        </span>

        <m.span
          className={styles.chevron}
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration, ease }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="size-3" fill="none">
            <path
              d="m5.5 7.5 4.5 4.5 4.5-4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </m.span>

        <span className={styles.summaryRow}>
          <span className={styles.tagViewport} aria-hidden={isExpanded}>
            <AnimatePresence initial={false}>
              {!isExpanded && religiousTags.length > 0 && (
                <m.span
                  key="collapsed-dietary-tags"
                  className={styles.collapsedTags}
                  initial={prefersReducedMotion ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-110%" }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.26,
                    ease,
                    delay: prefersReducedMotion ? 0 : 0.06,
                  }}
                >
                  {religiousTags.map((tag) => (
                    <ReligiousTagBadge key={tag} tag={tag} compact />
                  ))}
                </m.span>
              )}
            </AnimatePresence>
          </span>

          <span className={styles.summary}>
            <m.span
              className={styles.metric}
              initial={false}
              animate={{ x: isExpanded ? 0 : -74 }}
              transition={{ duration, ease }}
            >
              <span className={styles.metricLabel}>Calories</span>
              <span className={styles.caloriesValue}>
                {formatNutrient(calories)}
              </span>
            </m.span>

            <span className={styles.proteinViewport} aria-hidden={isExpanded}>
              <AnimatePresence initial={false}>
                {!isExpanded && (
                  <m.span
                    key="collapsed-protein"
                    className={styles.proteinSummary}
                    initial={prefersReducedMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-110%" }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.26,
                      ease,
                      delay: prefersReducedMotion ? 0 : 0.06,
                    }}
                  >
                    <span className={styles.proteinLabel}>Protein</span>
                    <span className={styles.proteinValue}>
                      {formatNutrient(proteinGrams, "g")}
                    </span>
                  </m.span>
                )}
              </AnimatePresence>
            </span>
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            key="nutrition-details"
            id={detailsId}
            className={styles.expandedContent}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration, ease }}
          >
            <div className={styles.expandedInner}>
              <div className={styles.nutrientGrid}>
                <dl className={styles.macroPanel}>
                  <div className={styles.macroHeader}>
                    <dt className={styles.macroValue}>Total fat</dt>
                    <dd className={styles.macroValue}>
                      {formatNutrient(totalFatGrams, "g")}
                    </dd>
                  </div>
                  <div className={styles.macroDetails}>
                    <div>
                      <dt className={styles.inlineDefinition}>Saturated </dt>
                      <dd className={styles.inlineDefinition}>
                        {formatNutrient(saturatedFatGrams, "g")}
                      </dd>
                    </div>
                    <div>
                      <dt className={styles.inlineDefinition}>Trans </dt>
                      <dd className={styles.inlineDefinition}>
                        {formatNutrient(transFatGrams, "g")}
                      </dd>
                    </div>
                  </div>
                </dl>

                <dl className={styles.macroPanel}>
                  <div className={styles.macroHeader}>
                    <dt className={styles.macroValue}>Carbohydrates</dt>
                    <dd className={styles.macroValue}>
                      {formatNutrient(totalCarbohydratesGrams, "g")}
                    </dd>
                  </div>
                  <div className={styles.macroDetails}>
                    <div>
                      <dt className={styles.inlineDefinition}>Fiber </dt>
                      <dd className={styles.inlineDefinition}>
                        {formatNutrient(dietaryFiberGrams, "g")}
                      </dd>
                    </div>
                    <div>
                      <dt className={styles.inlineDefinition}>Sugars </dt>
                      <dd className={styles.inlineDefinition}>
                        {formatNutrient(sugarsGrams, "g")}
                      </dd>
                    </div>
                  </div>
                </dl>

                <dl className={styles.micronutrientGrid}>
                  <div className={styles.micronutrientPanel}>
                    <dt className={styles.micronutrientLabel}>Protein</dt>
                    <dd className={styles.micronutrientValue}>
                      {formatNutrient(proteinGrams, "g")}
                    </dd>
                  </div>
                  <div className={styles.micronutrientPanel}>
                    <dt className={styles.micronutrientLabel}>Cholesterol</dt>
                    <dd className={styles.micronutrientValue}>
                      {formatNutrient(cholesterolMilligrams, "mg")}
                    </dd>
                  </div>
                  <div className={styles.micronutrientPanel}>
                    <dt className={styles.micronutrientLabel}>Sodium</dt>
                    <dd className={styles.micronutrientValue}>
                      {formatNutrient(sodiumMilligrams, "mg")}
                    </dd>
                  </div>
                </dl>
              </div>

              {religiousTags.length > 0 && (
                <section
                  className={styles.religiousSection}
                  aria-label="Religious dietary classifications"
                >
                  <h3 className={styles.religiousHeading}>Diet</h3>
                  <ul className={styles.tagList}>
                    {religiousTags.map((tag) => (
                      <li key={tag}>
                        <ReligiousTagBadge tag={tag} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}
