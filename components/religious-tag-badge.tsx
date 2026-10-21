import clsx from "clsx";

import type { ReligiousTag } from "@/lib/dining-types";

type ReligiousTagBadgeProps = {
  tag: ReligiousTag;
  compact?: boolean;
  variant?: "badge" | "text";
  title?: string;
};

const tagColors: Record<ReligiousTag, string> = {
  Halal: "bg-emerald-400/15 text-emerald-300",
  Haram: "bg-red-400/15 text-red-300",
  Kosher: "bg-blue-400/15 text-blue-300",
  "Non-Kosher": "bg-amber-400/15 text-amber-300",
};

const textColors: Record<ReligiousTag, string> = {
  Halal: "text-emerald-300",
  Haram: "text-red-300",
  Kosher: "text-blue-300",
  "Non-Kosher": "text-amber-300",
};

export function ReligiousTagBadge({
  tag,
  compact = false,
  variant = "badge",
  title,
}: ReligiousTagBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center whitespace-nowrap",
        "font-medium leading-none",
        variant === "text"
          ? clsx("text-[9px]", textColors[tag])
          : clsx(
              "rounded-[2px] py-0.5",
              compact ? "px-1 text-[8px]" : "px-1.5 text-[9px]",
              tagColors[tag],
            ),
      )}
      title={title}
    >
      {tag}
    </span>
  );
}
