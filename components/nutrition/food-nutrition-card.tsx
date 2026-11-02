"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import clsx from "clsx";

import { DietaryTagList } from "@/components/dietary/tag-list";
import { SlideReveal } from "@/components/motion/slide-reveal";
import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { getFoodDietaryStatus } from "@/lib/dietary/food-status";
import { MOTION_DURATION, STANDARD_EASING } from "@/lib/motion/constants";
import { NutritionSummary } from "./summary";
import { NutritionDetails } from "./details";
import { nutritionStyles as styles } from "./styles";
import type { FoodNutritionCardProps } from "./types";

export function FoodNutritionCard(food: FoodNutritionCardProps) {
  const {
    foodName,
    religiousTags,
    religiousTagReasons = {},
    ingredients = [],
    allergens = [],
  } = food;
  const [isExpanded, setIsExpanded] = useState(false);
  const { preferences, selectedRestrictions, calorieRange } =
    useDietaryPreferences();
  const {
    tags: visibleTags,
    restrictionMatches,
    shouldAvoid: showWarning,
  } = getFoodDietaryStatus(
    {
      foodName,
      ingredients,
      allergens,
      religiousTags,
      calories: food.calories,
    },
    preferences,
    selectedRestrictions,
    calorieRange,
  );
  const prefersReducedMotion = useReducedMotion();
  const cardId = useId();
  const titleId = `${cardId}-title`;
  const detailsId = `${cardId}-details`;
  const transition = {
    duration: prefersReducedMotion ? 0 : MOTION_DURATION.cardCollapse,
    ease: STANDARD_EASING,
  };

  return (
    <article
      className={clsx(
        styles.card,
        showWarning ? styles.warningCard : styles.neutralCard,
      )}
      aria-labelledby={titleId}
    >
      <m.span
        className={styles.warningGradient}
        initial={false}
        animate={{ opacity: showWarning ? 1 : 0 }}
        transition={transition}
        aria-hidden="true"
      />
      <div className="relative">
        <button
          type="button"
          className={styles.toggleButton}
          aria-label={`${isExpanded ? "Hide" : "Show"} nutrition for ${foodName}`}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        />
        <div className={styles.toggle}>
          <span id={titleId} className={styles.foodName} title={foodName}>
            {foodName}
          </span>

          <m.span
            className={styles.chevron}
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={transition}
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
            <span
              className={styles.tagViewport}
              aria-hidden={isExpanded}
              inert={isExpanded}
            >
              <SlideReveal
                isVisible={!isExpanded && visibleTags.length > 0}
                className={styles.collapsedTags}
              >
                <DietaryTagList
                  foodName={foodName}
                  tags={visibleTags}
                  reasons={religiousTagReasons}
                  restrictionMatches={restrictionMatches}
                  compact
                />
              </SlideReveal>
            </span>
            <NutritionSummary
              calories={food.calories}
              proteinGrams={food.proteinGrams}
              isExpanded={isExpanded}
            />
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <m.div
            key="nutrition-details"
            id={detailsId}
            className={styles.expandedContent}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
          >
            <NutritionDetails
              nutrition={food}
              foodName={foodName}
              tags={visibleTags}
              reasons={religiousTagReasons}
              restrictionMatches={restrictionMatches}
            />
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}
