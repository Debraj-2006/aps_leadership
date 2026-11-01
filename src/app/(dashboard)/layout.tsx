import { getCurrentProfile } from "@/lib/auth";
import { getMyNotifications, getUnreadNotificationCount } from "@/lib/actions/notifications";
import { getPendingApprovalCount } from "@/lib/actions/users";
import { AppShell } from "@/components/layout/app-shell";
import { canApprovePendingUsers } from "@/lib/roles";
import type { Notification } from "@/lib/types";

export default async function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();
  const [notifications, unreadCount, pendingApprovals] = await Promise.all([
    getMyNotifications(),
    getUnreadNotificationCount(),
    canApprovePendingUsers(profile.role) ? getPendingApprovalCount() : Promise.resolve(0),
  ]);

  return (
    <AppShell
      profile={profile}
      notifications={notifications as Notification[]}
      unreadCount={unreadCount}
      pendingApprovals={pendingApprovals}
    >
      {children}
    </AppShell>
  );
}
