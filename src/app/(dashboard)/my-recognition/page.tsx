import { format } from "date-fns";
import { Award, Sparkles } from "lucide-react";
import { cn } from "cn";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { getMyRecognition } from "@/lib/actions/recognition";
import { getBadge } from "@/lib/badges";

export default async function MyRecognitionPage() {
  const { points, pointHistory, badges } = await getMyRecognition();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Points & Badges"
        description="Points and event badges you've earned from the Executive Committee."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total points</p>
              <p className="text-3xl font-semibold tabular-nums">{points}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Award className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Badges earned</p>
              <p className="text-3xl font-semibold tabular-nums">{badges.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My badges</CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No badges yet. Executives award badges for great work on chapter events.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {badges.map((b) => (
                <li key={b.id} className="flex gap-3 rounded-lg border p-3">
                  <BadgeChip badge={b.badge} compact />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{getBadge(b.badge).label}</p>
                    {b.event_title && <p className="text-muted-foreground">For {b.event_title}</p>}
                    {b.note && <p className="mt-1">{b.note}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.awarder_name ? `By ${b.awarder_name} · ` : ""}
                      {format(new Date(b.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Points history</CardTitle>
        </CardHeader>
        <CardContent>
          {pointHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No points yet.</p>
          ) : (
            <ul className="divide-y">
              {pointHistory.map((p) => (
                <li key={p.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "inline-flex h-7 min-w-10 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums",
                      p.points > 0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                    )}
                  >
                    {p.points > 0 ? `+${p.points}` : p.points}
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p>{p.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.event_title ? `${p.event_title} · ` : ""}
                      {p.awarder_name ? `By ${p.awarder_name} · ` : ""}
                      {format(new Date(p.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
