import clsx from "clsx";

import { MotionSurface } from "@/components/motion/motion-surface";
import type { MenuMessageProps } from "./types";

export function MenuMessage({ title, description }: MenuMessageProps) {
  return (
    <MotionSurface
      className={clsx(
        "flex min-h-48 flex-col items-center justify-center gap-1.5",
        "px-5 py-10",
        "rounded-sm border border-line/70 bg-surface",
        "text-center text-sm text-muted",
      )}
    >
      <p className="font-semibold text-foreground">{title}</p>
      <p>{description}</p>
    </MotionSurface>
  );
}
