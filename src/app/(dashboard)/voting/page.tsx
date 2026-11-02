import { Vote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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
        <EmptyState
          icon={Vote}
          title="Yet to announce"
          description={
            canManage
              ? "Nothing is open yet. Use “New poll” to start one, and every member will be notified."
              : "Nothing is open for voting right now. When a poll opens, you'll get a notification and it will appear here."
          }
        />
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
