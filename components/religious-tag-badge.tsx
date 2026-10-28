import clsx from "clsx";

import type { DisplayReligiousTag } from "@/lib/dietary-preferences";

type ReligiousTagBadgeProps = {
  tag: DisplayReligiousTag;
  compact?: boolean;
  variant?: "badge" | "text";
  title?: string;
};

const tagColors: Record<DisplayReligiousTag, string> = {
  Halal: "bg-emerald-400/20 text-emerald-300",
  Haram: "bg-red-400/20 text-red-300",
  "Halal?": "bg-yellow-400/20 text-yellow-300",
  Kosher: "bg-blue-400/20 text-blue-300",
  "Non-Kosher": "bg-amber-400/20 text-amber-300",
};

const textColors: Record<DisplayReligiousTag, string> = {
  Halal: "text-emerald-300",
  Haram: "text-red-300",
  "Halal?": "text-yellow-300",
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
        "font-semibold leading-none",
        variant === "text"
          ? clsx("text-[11px]", textColors[tag])
          : clsx(
              "rounded-[2px] py-0.5",
              compact ? "px-1 text-[11px]" : "px-1.5 text-xs",
              tagColors[tag],
            ),
      )}
      title={
        title ??
        (tag === "Halal?"
          ? "Halal status unknown. Not confirmed Halal or Haram."
          : undefined)
      }
    >
      {tag}
    </span>
  );
}
