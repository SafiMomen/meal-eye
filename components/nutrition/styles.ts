import clsx from "clsx";

export const nutritionStyles = {
  card: clsx(
    "relative isolate w-full overflow-hidden",
    "rounded-sm border bg-card",
    "text-foreground",
    "transition-colors duration-200",
  ),
  neutralCard: "border-line/80 hover:border-muted/50",
  warningCard: "border-red-800/60 hover:border-red-700/70",
  warningGradient: clsx(
    "pointer-events-none absolute inset-0 -z-10",
    "bg-linear-to-b from-red-950/75 via-red-950/25 to-transparent",
  ),
  toggle: clsx(
    "pointer-events-none",
    "grid min-h-[4.75rem] w-full",
    "grid-cols-[minmax(0,1fr)_1.25rem_1.25rem] grid-rows-[2rem_auto]",
    "items-start gap-x-2 gap-y-1",
    "px-3 py-2.5",
    "rounded-sm text-left",
  ),
  toggleButton: clsx(
    "absolute inset-0 w-full",
    "cursor-pointer rounded-sm",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-accent focus-visible:ring-inset",
  ),
  foodName: clsx(
    "line-clamp-2 h-8 min-w-0",
    "text-[13px] font-semibold leading-4",
  ),
  summaryRow: clsx(
    "col-span-3 grid min-h-5 grid-cols-[minmax(0,1fr)_8.5rem] items-center gap-1",
  ),
  tagViewport: clsx("relative z-10 min-h-5 min-w-0 overflow-hidden"),
  collapsedTags: clsx("flex min-h-5 flex-wrap items-center gap-1"),
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
  additionalNutrientGrid: clsx(
    "col-span-6 grid grid-cols-3 gap-1.5",
    "text-center",
  ),
  additionalNutrientPanel: clsx(
    "flex flex-col items-center justify-center",
    "px-1 py-1",
    "rounded-[2px] bg-inset",
  ),
  additionalNutrientLabel: clsx("text-[9px] text-muted"),
  additionalNutrientValue: clsx("text-xs", "font-semibold"),
  religiousSection: clsx("flex items-center gap-1.5", "mt-1.5"),
  religiousHeading: clsx("text-[9px] text-muted", "font-semibold"),
  tagList: clsx("flex flex-wrap gap-1"),
};
