import { getCurrentProfile } from "@/lib/auth";
import { getMyNotifications, getUnreadNotificationCount } from "@/lib/actions/notifications";
import { getPendingApprovalCount } from "@/lib/actions/users";
import { getPendingPointRequestCount } from "@/lib/actions/point-requests";
import { AppShell } from "@/components/layout/app-shell";
import { canApprovePendingUsers } from "@/lib/roles";
import type { Notification } from "@/lib/types";

export default async function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();
  const isReviewer = canApprovePendingUsers(profile.role);
  const [notifications, unreadCount, pendingApprovals, pendingPointRequests] = await Promise.all([
    getMyNotifications(),
    getUnreadNotificationCount(),
    isReviewer ? getPendingApprovalCount() : Promise.resolve(0),
    isReviewer ? getPendingPointRequestCount() : Promise.resolve(0),
  ]);

  return (
    <AppShell
      profile={profile}
      notifications={notifications as Notification[]}
      unreadCount={unreadCount}
      navBadges={{ "/admin/users": pendingApprovals, "/recognition": pendingPointRequests }}
    >
      {children}
    </AppShell>
  );
}
