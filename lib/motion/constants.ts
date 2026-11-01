export const STANDARD_EASING = [0.22, 1, 0.36, 1] as const;

export const MOTION_OFFSET = {
  surfaceEnter: 12,
  mealToggleEnter: -8,
  menuExit: -6,
  categoryEnter: 10,
  foodEnter: 8,
  explanationEnter: 6,
} as const;

export const MENU_VIEWPORT = { category: 0.08, food: 0.15 } as const;
export const MENU_PRESS_SCALE = 0.995;

export const MOTION_DURATION = {
  default: 0.28,
  surface: 0.38,
  mealToggle: 0.35,
  availability: 0.2,
  menuEnter: 0.32,
  menuLayout: 0.3,
  foodOpacity: 0.28,
  cardCollapse: 0.3,
  summaryReveal: 0.26,
  explanation: 0.18,
} as const;

export const SUMMARY_REVEAL = {
  delay: 0.06,
  entryOffset: "110%",
  exitOffset: "-110%",
} as const;

export const MENU_STAGGER = {
  groupSize: 3,
  interval: 0.045,
} as const;

export const HALL_SELECTION_SPRING = {
  type: "spring",
  stiffness: 440,
  damping: 40,
} as const;

export const MEAL_SELECTION_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 34,
} as const;

// Reserve the protein summary's 64px width and its 10px visual gap.
export const COLLAPSED_CALORIES_OFFSET_PX = 74;
