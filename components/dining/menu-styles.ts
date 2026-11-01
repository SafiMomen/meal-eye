import clsx from "clsx";

export const menuStyles = {
  content: clsx("space-y-6", "px-4 py-5 sm:px-6 sm:py-6"),
  category: "space-y-2.5",
  categoryHeader: clsx("flex items-center gap-3"),
  categoryHeading: clsx(
    "shrink-0",
    "text-[11px] font-bold uppercase tracking-[0.14em] text-accent",
  ),
  categoryRule: "h-px w-full bg-line",
  foodGrid: clsx(
    "grid items-start grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-3",
  ),
  foodItem: "min-w-0",
};
