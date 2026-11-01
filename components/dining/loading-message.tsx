import clsx from "clsx";

import type { LoadingMessageProps } from "./types";

export function LoadingMessage({ children, className }: LoadingMessageProps) {
  return (
    <p
      className={clsx(
        "flex min-h-40 items-center justify-center",
        "rounded-sm border border-line/70 bg-surface",
        "px-5 py-8 text-sm text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
