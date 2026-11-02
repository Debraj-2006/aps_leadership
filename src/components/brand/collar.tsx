import { cn } from "@/lib/utils";

// A red collar stripe with a yellow bell hanging from the middle.
export function Collar({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-5", className)} aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-2 rounded-full bg-collar shadow-[inset_0_-2px_0_rgb(0_0_0/0.15)]" />
      <svg viewBox="0 0 20 20" className="absolute top-0.5 left-1/2 size-[18px] -translate-x-1/2">
        <circle cx="10" cy="10" r="8.5" fill="#ffcf00" stroke="#0f2a47" strokeWidth="1.3" />
        <path d="M2.6 7.6H17.4" stroke="#0f2a47" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="10" cy="12" r="1.6" fill="#0f2a47" />
        <path d="M10 13.6V18" stroke="#0f2a47" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
