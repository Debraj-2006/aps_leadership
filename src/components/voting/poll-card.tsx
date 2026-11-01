"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, Loader2, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { castVote, closePoll, deletePoll } from "@/lib/actions/voting";
import type { Poll } from "@/lib/actions/voting";
import { cn } from "@/lib/utils";

export function PollCard({ poll, canManage }: { poll: Poll; canManage: boolean }) {
  const [choice, setChoice] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const voted = Boolean(poll.my_option_id);
  const canVote = poll.is_open && !voted;
  const top = Math.max(...poll.options.map((o) => o.votes ?? 0), 0);

  function vote() {
    startTransition(async () => {
      const result = await castVote(poll.id, choice);
      if (result?.error) toast.error(result.error);
      else toast.success("Your vote is in.");
    });
  }

  function close() {
    if (!confirm("Close this poll? Nobody will be able to vote after this.")) return;
    startTransition(async () => {
      const result = await closePoll(poll.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Poll closed.");
    });
  }

  function remove() {
    if (!confirm("Delete this poll and all its votes? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deletePoll(poll.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Poll deleted.");
    });
  }

  return (
    <article className={cn("rounded-xl border bg-card p-5", poll.is_open && "shadow-[inset_3px_0_0_0_var(--trace)]")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-lg leading-snug font-semibold">{poll.title}</h2>
          {poll.description && <p className="mt-1 text-sm text-muted-foreground">{poll.description}</p>}
        </div>
        <StatusPill tone={poll.is_open ? "success" : "neutral"}>{poll.is_open ? "Open" : "Closed"}</StatusPill>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {poll.creator_name ? `By ${poll.creator_name} · ` : ""}
        {format(new Date(poll.created_at), "dd MMM yyyy")}
        {poll.closes_at && ` · ${poll.is_open ? "closes" : "closed"} ${format(new Date(poll.closes_at), "dd MMM yyyy, h:mm a")}`}
      </p>

      {canVote ? (
        <fieldset className="mt-4 space-y-2" disabled={pending}>
          <legend className="sr-only">Choose one</legend>
          {poll.options.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:border-primary/40",
                choice === o.id && "border-primary bg-primary/[0.05]"
              )}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={o.id}
                checked={choice === o.id}
                onChange={() => setChoice(o.id)}
                className="size-4 accent-primary"
              />
              {o.label}
            </label>
          ))}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground">One vote per member. Votes can&apos;t be changed and are anonymous.</p>
            <Button size="sm" onClick={vote} disabled={!choice || pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Submit vote
            </Button>
          </div>
        </fieldset>
      ) : (
        <div className="mt-4 space-y-2.5">
          {poll.options.map((o) => {
            const pct = poll.total_votes > 0 && o.votes !== null ? Math.round((o.votes / poll.total_votes) * 100) : 0;
            const mine = poll.my_option_id === o.id;
            const leading = poll.results_visible && o.votes !== null && o.votes > 0 && o.votes === top;
            return (
              <div key={o.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className={cn("flex items-center gap-1.5", leading && "font-semibold")}>
                    {o.label}
                    {mine && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <CheckCircle2 className="size-3.5" /> your vote
                      </span>
                    )}
                  </span>
                  {poll.results_visible && (
                    <span className="type-readout shrink-0 text-xs text-muted-foreground">
                      {o.votes} · {pct}%
                    </span>
                  )}
                </div>
                {poll.results_visible && (
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", leading ? "bg-trace" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            );
          })}
          <p className="pt-1 text-xs text-muted-foreground">
            {poll.results_visible
              ? `${poll.total_votes} vote${poll.total_votes === 1 ? "" : "s"}`
              : "Results appear once the poll closes."}
          </p>
        </div>
      )}

      {canManage && (
        <div className="mt-4 flex justify-end gap-2 border-t pt-3">
          {poll.is_open && (
            <Button size="sm" variant="outline" onClick={close} disabled={pending}>
              <Lock className="size-3.5" /> Close poll
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={remove} disabled={pending} aria-label="Delete poll">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      )}
    </article>
  );
}
