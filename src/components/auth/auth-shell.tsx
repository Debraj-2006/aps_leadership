import Image from "next/image";
import { Award, CalendarDays, ListChecks, ArrowLeftRight } from "lucide-react";
import apsLogo from "@/assets/brand/ieee-aps-logo.png";
import { PropagationArt } from "@/components/brand/propagation-art";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const INSIDE = [
  { icon: ListChecks, label: "Tasks" },
  { icon: Award, label: "Points & badges" },
  { icon: CalendarDays, label: "Events" },
  { icon: ArrowLeftRight, label: "Handovers" },
];

function LogoCard({ className }: { className?: string }) {
  return (
    <div className={`inline-flex rounded-xl bg-white shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] ${className ?? ""}`}>
      <Image src={apsLogo} alt="IEEE Antennas and Propagation Society" priority sizes="224px" className="h-auto w-full" />
    </div>
  );
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col overflow-hidden bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="relative z-10 px-10 pt-10 xl:px-14 xl:pt-12">
          <LogoCard className="w-60 px-5 py-4 xl:w-[16.5rem]" />
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute inset-x-10 inset-y-6 xl:inset-x-14">
            <PropagationArt id="auth-desktop" className="size-full" />
          </div>
        </div>

        <div className="relative z-10 px-10 pb-10 xl:px-14 xl:pb-12">
          <p className="type-eyebrow text-trace">IEM Student Branch Chapter</p>
          <h1 className="type-display mt-3 max-w-xl text-[2.4rem] font-bold leading-[1.02] tracking-[-0.025em] text-balance xl:text-[2.9rem]">
            Leadership &amp; tenure hub
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/72">
            Rosters, events, documents, tasks and handovers for every committee, kept in one place from one tenure to
            the next.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {INSIDE.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/85"
              >
                <Icon className="size-3.5 text-trace" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-col">
        <ThemeToggle className="absolute top-4 right-4 z-20 max-lg:bg-ink/70 max-lg:text-white max-lg:ring-1 max-lg:ring-white/15 max-lg:backdrop-blur-sm max-lg:hover:bg-ink max-lg:hover:text-white sm:top-5 sm:right-6" />
        <div className="relative overflow-hidden bg-ink px-6 pt-8 pb-7 text-white sm:px-10 lg:hidden">
          <div className="pointer-events-none absolute -top-2 -right-2 size-36 sm:size-44">
            <PropagationArt id="auth-mobile" className="size-full" />
          </div>
          <LogoCard className="relative z-10 w-40 px-3.5 py-3" />
          <p className="type-eyebrow relative z-10 mt-5 text-trace">IEM Student Branch Chapter</p>
          <p className="type-display relative z-10 mt-1.5 text-xl font-bold tracking-[-0.02em]">Leadership &amp; tenure hub</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-12">
          <div className="w-full max-w-sm">
            <p className="type-eyebrow flex items-center gap-2 text-primary">
              <span className="size-1.5 rounded-full bg-trace" aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 className="type-display mt-2 text-[1.85rem] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-8 space-y-3 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
