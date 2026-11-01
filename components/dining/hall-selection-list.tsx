"use client";

import { LayoutGroup } from "framer-motion";

import type { ChildrenProps } from "@/types/ui";

export function DiningHallSelectionList({ children }: ChildrenProps) {
  return (
    <LayoutGroup id="dining-hall-selection">
      <ul className="space-y-0.5">{children}</ul>
    </LayoutGroup>
  );
}
