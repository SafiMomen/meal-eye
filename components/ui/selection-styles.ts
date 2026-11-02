import clsx from "clsx";

export const selectionStyles = {
  option: clsx(
    "relative isolate flex items-center justify-center gap-2",
    "px-2 py-1.5 sm:px-3",
    "rounded-sm text-center text-sm font-semibold",
    "cursor-pointer transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
    "focus-visible:outline-accent",
  ),
  selected: "text-accent",
  idle: "text-muted hover:text-foreground",
  background: "absolute inset-0 -z-10 rounded-sm bg-princeton/12",
};
