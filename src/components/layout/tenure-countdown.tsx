"use client";

import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { TENURE_END, TENURE_END_LABEL } from "@/lib/config";
import { cn } from "@/lib/utils";

const END = new Date(TENURE_END).getTime();

function remaining(now: number) {
  const ms = Math.max(0, END - now);
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

// The current time only exists in the browser, so the numbers appear after the first tick.
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function TenureCountdown({ variant = "sidebar", className }: { variant?: "sidebar" | "compact"; className?: string }) {
  const now = useNow();
  const r = now === null ? null : remaining(now);

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "type-readout inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-trace/50 bg-trace/10 px-2 py-1 text-[11px] font-medium text-trace-ink",
          className
        )}
        title={`Tenure ends ${TENURE_END_LABEL}`}
      >
        <Hourglass className="size-3.5" />
        {r === null ? "—" : r.done ? "Tenure ended" : `${r.days}d left`}
      </span>
    );
  }

  const units = r ? [
    { label: "Days", value: String(r.days) },
    { label: "Hrs", value: pad(r.hours) },
    { label: "Min", value: pad(r.minutes) },
    { label: "Sec", value: pad(r.seconds) },
  ] : null;

  return (
    <div className={cn("rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-3", className)} role="timer" aria-live="off">
      <p className="type-eyebrow flex items-center gap-1.5 text-[10px] text-trace">
        <Hourglass className="size-3" />
        {r?.done ? "Tenure ended" : "Tenure ends in"}
      </p>
      {r?.done ? (
        <p className="mt-2 text-sm font-medium text-white">The {TENURE_END_LABEL} tenure is over.</p>
      ) : (
        <div className="mt-2 grid grid-cols-4 gap-1.5" aria-label={r ? `${r.days} days, ${r.hours} hours, ${r.minutes} minutes left` : undefined}>
          {(units ?? [{ label: "Days" }, { label: "Hrs" }, { label: "Min" }, { label: "Sec" }]).map((u) => (
            <div key={u.label} className="rounded-md bg-sidebar px-1 py-1.5 text-center">
              <p className="type-display text-base leading-none font-bold text-white tabular-nums">
                {"value" in u ? u.value : "–"}
              </p>
              <p className="mt-1 text-[9px] font-medium tracking-wide text-sidebar-foreground/55 uppercase">{u.label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] text-sidebar-foreground/60">Ends {TENURE_END_LABEL}</p>
    </div>
  );
}
