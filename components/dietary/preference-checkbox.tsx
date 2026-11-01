"use client";

import clsx from "clsx";
import type { PreferenceCheckboxProps } from "./types";

export function PreferenceCheckbox({
  label,
  checked,
  onChange,
}: PreferenceCheckboxProps) {
  return (
    <label
      className={clsx(
        "flex items-start gap-2",
        "cursor-pointer text-xs leading-4 text-foreground",
      )}
    >
      <input
        type="checkbox"
        className={clsx(
          "mt-0.5 size-3.5 shrink-0",
          "cursor-pointer accent-princeton",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-accent",
        )}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
