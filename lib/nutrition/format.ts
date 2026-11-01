export function formatNutrient(value: number | null, unit = ""): string {
  return value === null ? "N/A" : `${value}${unit}`;
}
