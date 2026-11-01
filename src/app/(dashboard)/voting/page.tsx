import { Vote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PropagationArt } from "@/components/brand/propagation-art";

// Placeholder until the Executive Committee announces a vote.
export default function VotingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Voting" description="Chapter elections and polls." />

      <section className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-center text-white sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute -top-6 right-0 size-40 opacity-80 sm:size-64">
          <PropagationArt id="voting" className="size-full" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
            <Vote className="size-7 text-trace" />
          </span>
          <p className="type-eyebrow mt-6 text-trace">Voting</p>
          <h2 className="type-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Yet to announce</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Nothing is open for voting right now. When the Executive Committee announces an election or poll, it will
            appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
