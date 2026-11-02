import Link from "next/link";
import { SkyScene } from "@/components/brand/sky-scene";
import { Gadget } from "@/components/brand/gadgets";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#0b1d45] px-6 pt-12 pb-48 text-white sm:pb-56">
      <SkyScene id="not-found" town="lg" />
      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <div className="gadget-float relative w-32 sm:w-40" aria-hidden="true">
          <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgb(255_236_170/0.32),transparent_62%)]" />
          <Gadget name="door" className="relative size-full drop-shadow-[0_10px_12px_rgb(0_0_0/0.35)]" />
        </div>
        <p className="type-eyebrow mt-6 text-trace">Page not found</p>
        <h1 className="type-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">We can&apos;t find that page</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          The link may be old or mistyped. Head back to the hub to find what you need.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-full bg-trace px-5 text-sm font-semibold text-[#0f2a47] shadow-[0_8px_20px_-8px_rgb(255_207_0/0.6)] transition-colors hover:bg-[#ffdb4d] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Back to the hub
        </Link>
      </div>
    </main>
  );
}
