import { cn } from "@/lib/utils";

export interface Readout {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

// A row of instrument-style readouts: label, value, one line of context.
export function ReadoutStrip({ items, className }: { items: Readout[]; className?: string }) {
  const cols: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  };
  return (
    <dl className={cn("grid gap-3", cols[items.length] ?? "grid-cols-2", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col rounded-2xl bg-card px-4 py-4 shadow-[0_14px_34px_-24px_rgb(0_90_160/0.55)] ring-1 ring-primary/12 sm:px-5"
        >
          <dt className="type-eyebrow truncate text-primary">{item.label}</dt>
          <dd className="type-display mt-2 truncate text-[1.6rem] leading-none font-bold tracking-[-0.02em] tabular-nums">
            {item.value}
          </dd>
          {item.hint && <dd className="mt-2 truncate text-xs text-muted-foreground">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
