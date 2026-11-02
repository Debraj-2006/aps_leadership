import { SectionEyebrow } from "@/components/shared/section-eyebrow";
import { SkyScene, Town } from "@/components/brand/sky-scene";
import { PageGadget } from "@/components/brand/page-gadget";

// Every page opens on the same night-sky town as the dashboard, with the gadget from
// Doraemon's pocket that belongs to this section floating above the rooftops.
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-2xl bg-[#0b1d45] text-white shadow-[0_18px_40px_-26px_rgb(10_28_77/0.8)]">
      <div className="relative px-5 pt-6 sm:px-8 sm:pt-7">
        <SkyScene id="page-banner" town={false} moon={false} petals={false} />
        <PageGadget className="pointer-events-none absolute right-4 bottom-10 z-[5] w-20 sm:right-[7%] sm:bottom-12 sm:w-28 lg:right-[9%] lg:w-32" />

        <div className="relative z-10 max-w-[68%] sm:max-w-[70%]">
          <SectionEyebrow override={eyebrow} onDark />
          <h1 className="type-display mt-2 text-[1.6rem] font-bold leading-[1.1] tracking-[-0.02em] text-balance sm:text-[2.1rem]">
            {title}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">{description}</p>}
          {actions && (
            // A light tray so every button style keeps its normal contrast on the night sky.
            <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl bg-card/95 p-1.5 text-foreground shadow-lg ring-1 ring-white/25 backdrop-blur">
              {actions}
            </div>
          )}
        </div>

        <Town
          id="page-banner-town"
          className="relative -mx-5 mt-5 block h-12 w-[calc(100%+2.5rem)] sm:-mx-8 sm:h-16 sm:w-[calc(100%+4rem)]"
        />
      </div>
      <div className="h-1.5 bg-collar" aria-hidden="true" />
    </header>
  );
}
