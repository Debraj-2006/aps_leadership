import Image from "next/image";
import { Award, CalendarDays, ListChecks, ArrowLeftRight } from "lucide-react";
import apsLogo from "@/assets/brand/ieee-aps-logo.png";
import sakura from "@/assets/brand/login-sakura.jpg";
import { FallingPetals } from "@/components/brand/sky-scene";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const INSIDE = [
  { icon: ListChecks, label: "Tasks" },
  { icon: Award, label: "Points & badges" },
  { icon: CalendarDays, label: "Events" },
  { icon: ArrowLeftRight, label: "Handovers" },
];

function LogoCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-white shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      <Image
        src={apsLogo}
        alt="IEEE Antennas and Propagation Society"
        preload
        sizes="224px"
        className="h-auto w-full"
      />
    </div>
  );
}

// The cherry-blossom picture, shown sharp in a white photo frame. The source is small,
// so it is never stretched to fill a panel; a blurred copy does that job instead.
function SakuraPhoto({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[292/529] rounded-[1.35rem] bg-white/95 p-1.5 shadow-[0_30px_60px_-18px_rgb(0_0_0/0.65)] ring-1 ring-white/50",
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-[1.05rem]">
        <Image
          src={sakura}
          alt="Doraemon and Nobita watching a spring sunset under cherry blossoms"
          fill
          sizes="300px"
          placeholder="blur"
          className="object-cover"
        />
      </div>
    </div>
  );
}

// Soft colour wash made from the same picture, for behind the frame.
function SakuraBackdrop() {
  return (
    <>
      <Image
        src={sakura}
        alt=""
        fill
        sizes="300px"
        className="scale-125 object-cover blur-3xl saturate-[1.35]"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgb(249_180_207/0.38),transparent_45%),radial-gradient(circle_at_0%_75%,rgb(249_180_207/0.22),transparent_40%)]"
        aria-hidden="true"
      />
      <FallingPetals count={24} className="absolute inset-0 size-full" />
    </>
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
      <aside className="relative hidden flex-col overflow-hidden bg-[#0b1d45] text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <SakuraBackdrop />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_29_69/0.4)_0%,rgb(11_29_69/0.08)_30%,rgb(11_29_69/0.35)_62%,rgb(11_29_69/0.94)_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 px-10 pt-10 xl:px-14 xl:pt-12">
          <LogoCard className="w-60 px-5 py-4 xl:w-[16.5rem]" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-10 py-6">
          <SakuraPhoto className="h-[min(100%,32rem)] -rotate-2" />
        </div>

        <div className="relative z-10 px-10 pb-10 xl:px-14 xl:pb-12">
          <p className="type-eyebrow text-trace">IEM Student Branch Chapter</p>
          <h1 className="type-display mt-3 max-w-xl text-[2.4rem] font-bold leading-[1.02] tracking-[-0.025em] text-balance xl:text-[2.9rem]">
            Leadership hub
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
            Rosters, events, documents, tasks and handovers for the whole
            committee, kept in one place.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 [@media(max-height:800px)]:hidden">
            {INSIDE.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm"
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
        <div className="relative overflow-hidden bg-[#0b1d45] px-6 pt-8 pb-7 text-white sm:px-10 lg:hidden">
          <SakuraBackdrop />
          <div
            className="absolute inset-0 bg-[#0b1d45]/45"
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-end justify-between gap-5">
            <div className="min-w-0 pb-1">
              <LogoCard className="w-40 px-3.5 py-3" />
              <p className="type-eyebrow mt-5 text-trace">
                IEM Student Branch Chapter
              </p>
              <p className="type-display mt-1.5 text-xl font-bold tracking-[-0.02em]">
                Leadership hub
              </p>
            </div>
            {/* Starts below the theme toggle in the top-right corner. */}
            <SakuraPhoto className="mt-8 w-24 shrink-0 rotate-3 sm:w-28" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-12">
          <div className="w-full max-w-sm">
            <p className="type-eyebrow flex items-center gap-2 text-primary">
              <span
                className="size-1.5 rounded-full bg-trace"
                aria-hidden="true"
              />
              {eyebrow}
            </p>
            <h2 className="type-display mt-2 text-[1.85rem] font-bold leading-[1.1] tracking-[-0.02em]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-8 space-y-3 border-t pt-6 text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
