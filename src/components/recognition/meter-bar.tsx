import { cn } from "@/lib/utils";

// Level meter: a member's points relative to the leader, with tick marks every 25%.
export function MeterBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="presentation"
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      {[25, 50, 75].map((t) => (
        <span key={t} className="absolute inset-y-0 w-px bg-card/80" style={{ left: `${t}%` }} />
      ))}
    </div>
  );
}
