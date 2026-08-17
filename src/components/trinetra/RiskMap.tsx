import { lazy, Suspense } from "react";
import { ClientOnly } from "./ClientOnly";
import type { RiskResult } from "@/lib/trinetra/engine";

const Inner = lazy(() => import("./RiskMapInner"));

interface Props {
  results: RiskResult[];
  selectedId?: string | undefined;
  onSelect?: (id: string) => void;
  showHeat?: boolean;
  showRoutes?: boolean;
}

function MapSkeleton() {
  return (
    <div className="scanline scan-sweep grid-overlay flex h-full w-full items-center justify-center rounded-xl bg-surface-2">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground animate-blink">
        Acquiring Nagpur grid…
      </p>
    </div>
  );
}

export function RiskMap(props: Props) {
  return (
    <ClientOnly fallback={<MapSkeleton />}>
      <Suspense fallback={<MapSkeleton />}>
        <Inner {...props} />
      </Suspense>
    </ClientOnly>
  );
}
