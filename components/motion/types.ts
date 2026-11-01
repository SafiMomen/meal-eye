import type { ChildrenProps } from "@/types/ui";

export type MotionSurfaceProps = ChildrenProps & {
  className?: string;
  delay?: number;
};

export type SlideRevealProps = ChildrenProps & {
  isVisible: boolean;
  className?: string;
};
