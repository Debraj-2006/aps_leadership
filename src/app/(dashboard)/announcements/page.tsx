import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { AnnouncementFormDialog } from "@/components/announcements/announcement-form-dialog";
import { getAnnouncements } from "@/lib/actions/announcements";
import { getCurrentProfile } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function AnnouncementsPage() {
  const [{ profile }, { items, ready }] = await Promise.all([getCurrentProfile(), getAnnouncements()]);
  const canManage = isAdminRole(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Notices from the Executive Committee. Pinned ones also show at the top of everyone's home page."
        actions={canManage && ready ? <AnnouncementFormDialog /> : undefined}
      />

      {!ready ? (
        <EmptyState
          icon={Megaphone}
          title="Announcements aren't switched on yet"
          description={
            canManage
              ? "Run the 0013 database update in Supabase, then come back here to post the first one."
              : "Check back soon. Announcements from the Executive Committee will show here."
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description={
            canManage
              ? "Use “New announcement” to post the first one. Everyone gets a notification."
              : "When the Executive Committee posts something, it will show here and you'll get a notification."
          }
        />
      ) : (
        <div className="max-w-3xl space-y-4">
          {items.map((a) => (
            <AnnouncementCard key={a.id} item={a} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
