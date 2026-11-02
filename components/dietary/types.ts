import type {
  DietaryPreferences,
  DietarySettings,
  CalorieRange,
  DietaryRestriction,
  DietaryTag,
  ReligiousTagReason,
  ReligiousTagReasons,
  RestrictionMatch,
} from "@/types/dietary";

export type DietaryPreferencesContextValue = DietarySettings & {
  setPreference: (
    preference: keyof DietaryPreferences,
    enabled: boolean,
  ) => void;
  setRestriction: (restriction: DietaryRestriction, enabled: boolean) => void;
  setHideUnwantedMeals: (enabled: boolean) => void;
  setCalorieRange: (range: CalorieRange) => void;
};

export type PreferenceCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
};

export type DietaryTagBadgeProps = {
  tag: DietaryTag;
  abbreviated?: boolean;
  compact?: boolean;
  title?: string;
  foodName?: string;
  reasons?: readonly ReligiousTagReason[];
  restrictionMatches?: readonly RestrictionMatch[];
};

export type DietaryTagExplanationProps = {
  tag: DietaryTag;
  foodName?: string;
  reasons: readonly ReligiousTagReason[];
  restrictionMatches: readonly RestrictionMatch[];
  onDismiss: () => void;
};

export type DietaryTagListProps = {
  foodName: string;
  tags: readonly DietaryTag[];
  reasons: ReligiousTagReasons;
  restrictionMatches?: readonly RestrictionMatch[];
  compact?: boolean;
  abbreviated?: boolean;
};
