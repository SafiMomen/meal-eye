import type { ProfileFieldProps } from "./types";

export function ProfileField({ label, children }: ProfileFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
