import { Suspense } from "react";

import { DiningWorkspace } from "@/components/dining/workspace";
import { DiningWorkspaceFallback } from "@/components/dining/workspace-fallback";
import type { DiningWorkspaceProps } from "@/components/dining/types";

export default function Home({ searchParams }: DiningWorkspaceProps) {
  return (
    <Suspense fallback={<DiningWorkspaceFallback />}>
      <DiningWorkspace searchParams={searchParams} />
    </Suspense>
  );
}
