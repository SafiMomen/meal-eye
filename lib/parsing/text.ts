export function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNutritionNumber(value: string | undefined): number | null {
  const numericMatch = value?.match(/-?\d+(?:\.\d+)?/);
  return numericMatch ? Number(numericMatch[0]) : null;
}

export function parseCommaSeparatedList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value.split(",").map(normalizeWhitespace).filter(Boolean);
}
