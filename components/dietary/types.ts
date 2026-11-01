import type {
  DietaryPreferences,
  DietaryRestriction,
  DietaryTag,
  ReligiousTagReason,
  ReligiousTagReasons,
  RestrictionMatch,
} from "@/types/dietary";

export type DietaryPreferencesContextValue = {
  preferences: DietaryPreferences;
  setPreference: (
    preference: keyof DietaryPreferences,
    enabled: boolean,
  ) => void;
  selectedRestrictions: readonly DietaryRestriction[];
  setRestriction: (restriction: DietaryRestriction, enabled: boolean) => void;
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
