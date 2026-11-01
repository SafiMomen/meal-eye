const PRINCETON_TIME_ZONE = "America/New_York";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PRINCETON_TIME_ZONE,
  weekday: "short",
});

export function isPrincetonWeekend(date: Date): boolean {
  const weekday = weekdayFormatter.format(date);
  return weekday === "Sat" || weekday === "Sun";
}
