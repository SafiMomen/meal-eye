export const PRINCETON_TIME_ZONE = "America/New_York";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PRINCETON_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getPrincetonDateKey(date: Date): string {
  const parts = dateFormatter.formatToParts(date);
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join("-");
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PRINCETON_TIME_ZONE,
  weekday: "short",
});

export function isPrincetonWeekend(date: Date): boolean {
  const weekday = weekdayFormatter.format(date);
  return weekday === "Sat" || weekday === "Sun";
}
