import { Suspense } from "react";
import { FitnessNavigation } from "@/components/fitness/navigation";
import type { ChildrenProps } from "@/types/ui";

export default function FitnessLayout({ children }: ChildrenProps) {
  return (
    <div className="min-h-screen w-full flex-1 bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:py-7">
        <Suspense fallback={<div className="mb-8 h-9" aria-hidden="true" />}>
          <FitnessNavigation />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
