import { format } from "date-fns";
import { Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { ReadoutStrip } from "@/components/shared/readout-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeChip } from "@/components/recognition/badge-chip";
import { getMyRecognition } from "@/lib/actions/recognition";
import { getBadge } from "@/lib/badges";

export default async function MyRecognitionPage() {
  const { points, pointHistory, badges } = await getMyRecognition();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My points & badges"
        description="Points and event badges you've earned from the Executive Committee."
      />

      <ReadoutStrip
        items={[
          { label: "Total points", value: points, hint: `From ${pointHistory.length} award${pointHistory.length === 1 ? "" : "s"}` },
          { label: "Badges earned", value: badges.length, hint: "For chapter events" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <EmptyState
              compact
              icon={Award}
              title="No badges yet"
              description="Executives award badges for standout work on a chapter event."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {badges.map((b) => (
                <li key={b.id} className="flex gap-3 rounded-lg border p-3">
                  <BadgeChip badge={b.badge} compact />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{getBadge(b.badge).label}</p>
                    {b.event_title && <p className="text-muted-foreground">{b.event_title}</p>}
                    {b.note && <p className="mt-1">{b.note}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.awarder_name ? `${b.awarder_name} · ` : ""}
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
          <CardTitle>Points history</CardTitle>
        </CardHeader>
        <CardContent>
          {pointHistory.length === 0 ? (
            <EmptyState compact icon={Sparkles} title="No points yet" description="Points you earn will be listed here with the reason." />
          ) : (
            <ul className="divide-y">
              {pointHistory.map((p) => (
                <li key={p.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "type-readout inline-flex h-7 min-w-11 items-center justify-center rounded-full px-2 text-xs font-semibold",
                      p.points > 0 ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {p.points > 0 ? `+${p.points}` : p.points}
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p>{p.reason}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.event_title ? `${p.event_title} · ` : ""}
                      {p.awarder_name ? `${p.awarder_name} · ` : ""}
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
