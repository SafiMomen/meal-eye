"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import { ReligiousTagExplanation } from "@/components/religious-tag-explanation";
import type { DisplayReligiousTag } from "@/lib/dietary-preferences";
import type { ReligiousTagReason } from "@/lib/dining-types";
import { religiousTagColors, religiousTagTextColors } from "@/lib/religious-tag-styles";

type ReligiousTagBadgeProps = {
  tag: DisplayReligiousTag;
  compact?: boolean;
  variant?: "badge" | "text";
  title?: string;
  foodName?: string;
  reasons?: readonly ReligiousTagReason[];
};

export function ReligiousTagBadge({
  tag,
  compact = false,
  variant = "badge",
  title,
  foodName,
  reasons = [],
}: ReligiousTagBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isPossibleHalal = tag === "Halal?";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          "pointer-events-auto inline-flex shrink-0 items-center whitespace-nowrap",
          "font-semibold leading-none",
          "cursor-pointer transition-[filter] hover:brightness-125",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          variant === "text"
            ? clsx("text-[11px]", religiousTagTextColors[tag])
            : clsx(
                "rounded-[2px] py-0.5",
                compact ? "px-1 text-[11px]" : "px-1.5 text-xs",
                religiousTagColors[tag],
              ),
        )}
        title={title ?? "Click to see why this tag was applied."}
        aria-label={`Show why ${foodName ?? "this item"} is ${isPossibleHalal ? "possibly Halal" : tag}`}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        {isPossibleHalal ? "Halal" : tag}
      </button>
      {isOpen &&
        createPortal(
          <ReligiousTagExplanation
            tag={tag}
            foodName={foodName}
            reasons={reasons}
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
