import { formatDistanceToNow } from "date-fns";
import { HandHeart, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { ReviewPointRequestButtons, WithdrawPointRequestButton } from "@/components/recognition/point-request-actions";
import { ROLE_LABELS } from "@/lib/roles";
import type { PointRequestRow } from "@/lib/actions/point-requests";

const STATUS = {
  pending: { tone: "warning", label: "Waiting for review" },
  approved: { tone: "success", label: "Approved" },
  declined: { tone: "neutral", label: "Declined" },
} as const;

function PointsChip({ points }: { points: number }) {
  return (
    <span className="type-readout inline-flex h-7 min-w-10 shrink-0 items-center justify-center rounded-full bg-success/12 px-2 text-xs font-semibold text-success">
      +{points}
    </span>
  );
}

// For Executives: every pending request, oldest first, with Approve / Decline.
export function PointRequestReviewList({ requests }: { requests: PointRequestRow[] }) {
  if (requests.length === 0) return null;
  return (
    <section aria-labelledby="point-requests-heading" className="space-y-3">
      <h2 id="point-requests-heading" className="type-eyebrow flex items-center gap-2 text-foreground">
        <span className="size-1.5 rounded-full bg-trace" aria-hidden="true" />
        Point requests to review
        <span className="type-readout rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground">{requests.length}</span>
      </h2>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {requests.map((r) => (
          <li key={r.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-[inset_3px_0_0_0_var(--trace)]">
            <div className="flex items-start gap-3">
              <PointsChip points={r.points} />
              <div className="min-w-0 flex-1 text-sm">
                <p className="leading-snug">
                  <span className="font-medium">{r.requester?.full_name ?? "A former member"}</span>
                  {r.requester && <span className="text-muted-foreground"> ({ROLE_LABELS[r.requester.role]})</span>} asks to give{" "}
                  <span className="font-medium">{r.recipient?.full_name ?? "a former member"}</span>
                  {r.recipient && <span className="text-muted-foreground"> ({ROLE_LABELS[r.recipient.role]})</span>} {r.points}{" "}
                  points
                </p>
                <p className="mt-1.5 rounded-md bg-muted/60 px-3 py-2">{r.reason}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {r.event?.title ? `${r.event.title} · ` : ""}
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end border-t pt-3">
              <ReviewPointRequestButtons id={r.id} recipientName={r.recipient?.full_name ?? "the member"} points={r.points} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// For Core and Working members: the requests they've sent and what happened to them.
export function MyPointRequests({ requests }: { requests: PointRequestRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="size-4 text-muted-foreground" /> Your point requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <EmptyState
            compact
            icon={Inbox}
            title="No requests yet"
            description="Use “Request points” to recognise a teammate. An Executive approves it before the points are added."
          />
        ) : (
          <ul className="divide-y">
            {requests.map((r) => {
              const status = STATUS[r.status];
              return (
                <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <PointsChip points={r.points} />
                  <div className="min-w-0 flex-1 text-sm">
                    <p>
                      For <span className="font-medium">{r.recipient?.full_name ?? "a former member"}</span>
                    </p>
                    <p className="text-muted-foreground">{r.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      {r.reviewer && r.status !== "pending" ? ` · ${status.label.toLowerCase()} by ${r.reviewer.full_name}` : ""}
                    </p>
                    {r.review_note && <p className="mt-1 text-xs italic text-muted-foreground">“{r.review_note}”</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    {r.status === "pending" && <WithdrawPointRequestButton id={r.id} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
