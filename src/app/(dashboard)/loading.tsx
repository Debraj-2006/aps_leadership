import { Skeleton } from "@/components/ui/skeleton";
import { SkyScene, Town } from "@/components/brand/sky-scene";

// Shown immediately on every navigation inside the app while the next page loads:
// the night-sky banner appears straight away, then the page fills in.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-[#0b1d45] sm:h-52">
        <SkyScene id="loading-banner" town={false} moon={false} petals={false} />
        <div className="relative z-10 space-y-3 px-5 pt-6 sm:px-8 sm:pt-7">
          <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
          <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-white/25" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/15" />
        </div>
        <Town id="loading-town" className="absolute inset-x-0 bottom-1.5 h-12 w-full sm:h-16" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-collar" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
