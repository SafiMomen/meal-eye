import clsx from "clsx";

export const fitnessStyles = {
  input: clsx(
    "w-full min-w-0 px-2.5 py-2",
    "rounded-sm border border-line bg-black/15 text-sm text-foreground",
    "focus-visible:outline-2 focus-visible:outline-accent",
  ),
  action: clsx(
    "px-3 py-2",
    "rounded-sm bg-princeton/15 text-xs font-semibold text-accent",
    "cursor-pointer hover:bg-princeton/25",
    "focus-visible:outline-2 focus-visible:outline-accent",
  ),
  mutedButton: clsx(
    "text-xs text-muted",
    "cursor-pointer hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent",
  ),
  removeButton: clsx(
    "flex size-6 shrink-0 items-center justify-center",
    "rounded-sm bg-red-950/60 text-red-300",
    "cursor-pointer hover:bg-red-900/60 hover:text-red-200",
    "focus-visible:outline-2 focus-visible:outline-red-300",
  ),
  portionSlider: clsx(
    "h-1 w-full min-w-0",
    "cursor-pointer accent-princeton",
    "focus-visible:outline-2 focus-visible:outline-accent",
  ),
  caption: "text-[11px] leading-5 text-muted",
};
