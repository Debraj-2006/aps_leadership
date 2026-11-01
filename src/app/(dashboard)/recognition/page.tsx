import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ReadoutStrip } from "@/components/shared/readout-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardPointsDialog } from "@/components/recognition/award-points-dialog";
import { AwardBadgeDialog } from "@/components/recognition/award-badge-dialog";
import { RecognitionFeed } from "@/components/recognition/recognition-feed";
import { MembersPointsTable } from "@/components/recognition/members-points-table";
import { PointRequestReviewList } from "@/components/recognition/point-request-lists";
import { getCurrentProfile } from "@/lib/auth";
import { getLeaderboard, getRecentRecognition, getRecognitionOptions } from "@/lib/actions/recognition";
import { getPendingPointRequests } from "@/lib/actions/point-requests";
import { canAwardRecognition } from "@/lib/roles";

// Executive tools for recognition: give points and badges, review peer requests.
export default async function RecognitionPage() {
  const { profile } = await getCurrentProfile();
  if (!canAwardRecognition(profile.role)) redirect("/my-recognition");

  const [members, feed, options, pendingRequests] = await Promise.all([
    getLeaderboard(),
    getRecentRecognition(30),
    getRecognitionOptions(),
    getPendingPointRequests(),
  ]);

  const totalPoints = members.reduce((sum, e) => sum + e.points, 0);
  const totalBadges = members.reduce((sum, e) => sum + e.badges.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Points & badges"
        description="Give points and event badges to Core and Working Committee members, and review the point requests they send for each other."
        actions={
          <>
            <AwardBadgeDialog members={options.members} events={options.events} />
            <AwardPointsDialog members={options.pointMembers} events={options.events} canAwardAnyone={options.canAwardAnyone} />
          </>
        }
      />

      <PointRequestReviewList requests={pendingRequests} />

      <ReadoutStrip
        items={[
          { label: "Requests waiting", value: pendingRequests.length, hint: "Peer point requests" },
          { label: "Points given", value: totalPoints, hint: "Across all members" },
          { label: "Badges awarded", value: totalBadges, hint: "For chapter events" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent recognition</CardTitle>
        </CardHeader>
        <CardContent>
          <RecognitionFeed items={feed} canUndo />
        </CardContent>
      </Card>

      <MembersPointsTable entries={members} currentUserId={profile.id} />
    </div>
  );
}
