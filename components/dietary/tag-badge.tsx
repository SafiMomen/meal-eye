"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { DietaryTagBadgeProps } from "./types";

import { DietaryTagExplanation } from "@/components/dietary/tag-explanation";
import {
  dietaryTagBadgeStyles,
  dietaryTagColors,
} from "@/lib/dietary/tag-styles";
import { getDietaryTagLabel } from "@/lib/dietary/tag-labels";

export function DietaryTagBadge({
  tag,
  compact = false,
  abbreviated = false,
  title,
  foodName,
  reasons = [],
  restrictionMatches = [],
}: DietaryTagBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isPossibleHalal = tag === "Halal?";
  const accessibleTagName = isPossibleHalal ? "possibly Halal" : tag;
  const explanationLabel = `Show why ${foodName ?? "this item"} is ${accessibleTagName}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          "pointer-events-auto",
          dietaryTagBadgeStyles.label,
          "cursor-pointer transition-[filter] hover:brightness-125",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          dietaryTagBadgeStyles.badge,
          compact
            ? dietaryTagBadgeStyles.compact
            : dietaryTagBadgeStyles.regular,
          dietaryTagColors[tag],
        )}
        title={
          title ??
          `${accessibleTagName}: click to see why this tag was applied.`
        }
        aria-label={explanationLabel}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        {getDietaryTagLabel(tag, abbreviated)}
      </button>
      {isOpen &&
        createPortal(
          <DietaryTagExplanation
            tag={tag}
            foodName={foodName}
            reasons={reasons}
            restrictionMatches={restrictionMatches}
            onDismiss={() => {
              setIsOpen(false);
              triggerRef.current?.focus();
            }}
          />,
          document.body,
        )}
    </>
  );
}
