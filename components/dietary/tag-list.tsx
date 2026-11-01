"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { getDietaryTagLabel } from "@/lib/dietary/tag-labels";
import { dietaryTagBadgeStyles } from "@/lib/dietary/tag-styles";
import { DietaryTagBadge } from "./tag-badge";
import type { DietaryTagListProps } from "./types";

export function DietaryTagList({
  foodName,
  tags,
  reasons,
  restrictionMatches,
  compact = false,
  abbreviated: forceAbbreviated = false,
}: DietaryTagListProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const fullLabelsRef = useRef<HTMLSpanElement>(null);
  const [abbreviated, setAbbreviated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const fullLabels = fullLabelsRef.current;

    if (!compact || forceAbbreviated || !container || !fullLabels) {
      return;
    }

    // Measure full labels separately so abbreviating cannot cause a resize loop.
    const observer = new ResizeObserver(() => {
      setAbbreviated(
        fullLabels.getBoundingClientRect().width > container.clientWidth,
      );
    });

    observer.observe(container);
    observer.observe(fullLabels);
    return () => observer.disconnect();
  }, [compact, forceAbbreviated]);

  const badges = tags.map((tag) => {
    const badge = (
      <DietaryTagBadge
        key={tag}
        tag={tag}
        foodName={foodName}
        reasons={tag === "Halal?" || tag === "Restricted" ? [] : reasons[tag]}
        restrictionMatches={restrictionMatches}
        compact={compact}
        abbreviated={forceAbbreviated || (compact && abbreviated)}
      />
    );

    return compact ? badge : <li key={tag}>{badge}</li>;
  });

  return compact ? (
    <span
      ref={containerRef}
      className="relative flex w-full min-w-0 flex-wrap gap-1"
    >
      {!forceAbbreviated && (
        <span
          ref={fullLabelsRef}
          className="pointer-events-none invisible absolute left-0 top-0 flex w-max gap-1"
          aria-hidden="true"
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className={clsx(
                dietaryTagBadgeStyles.label,
                dietaryTagBadgeStyles.badge,
                dietaryTagBadgeStyles.compact,
              )}
            >
              {getDietaryTagLabel(tag)}
            </span>
          ))}
        </span>
      )}
      {badges}
    </span>
  ) : (
    <ul className="flex flex-wrap gap-1">{badges}</ul>
  );
}
