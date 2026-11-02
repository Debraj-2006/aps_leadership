import { Vote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SkyScene } from "@/components/brand/sky-scene";
import { NewPollDialog } from "@/components/voting/new-poll-dialog";
import { PollCard } from "@/components/voting/poll-card";
import { getPolls, getVotingAccess } from "@/lib/actions/voting";

export default async function VotingPage() {
  const [{ polls }, canManage] = await Promise.all([getPolls(), getVotingAccess()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voting"
        description="Chapter elections and polls. Every member gets one anonymous vote per poll."
        actions={canManage ? <NewPollDialog /> : undefined}
      />

      {polls.length === 0 ? (
        <section className="relative overflow-hidden rounded-2xl bg-ink px-6 pt-14 pb-36 text-center text-white sm:px-10 sm:pt-20 sm:pb-44">
          <SkyScene id="voting" town="md" />
          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <Vote className="size-7 text-trace" />
            </span>
            <p className="type-eyebrow mt-6 text-trace">Voting</p>
            <h2 className="type-display mt-2 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Yet to announce</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {canManage
                ? "Nothing is open yet. Use “New poll” to start one, and every member will be notified."
                : "Nothing is open for voting right now. When a poll opens, you'll get a notification and it will appear here."}
            </p>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {polls.map((p) => (
            <PollCard key={p.id} poll={p} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
