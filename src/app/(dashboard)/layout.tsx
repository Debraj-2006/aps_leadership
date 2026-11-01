import { getCurrentProfile } from "@/lib/auth";
import { getMyNotifications, getUnreadNotificationCount } from "@/lib/actions/notifications";
import { AppShell } from "@/components/layout/app-shell";
import type { Notification } from "@/lib/types";

export default async function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();
  const [notifications, unreadCount] = await Promise.all([
    getMyNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <AppShell
      profile={profile}
      notifications={notifications as Notification[]}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
