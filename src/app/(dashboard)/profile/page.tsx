import { format } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { ProfileForm } from "@/components/profile/profile-form";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="type-eyebrow text-[10px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const { profile } = await getCurrentProfile();
  const name = profile.full_name || profile.email;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Keep your details up to date. Your photo shows next to your name across the hub."
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card>
          <CardContent className="pt-2">
            <PhotoUploader name={name} src={profile.avatar_url} />
            <dl className="mt-6 divide-y border-t">
              <Fact label="Email" value={profile.email} />
              <Fact label="Committee" value={ROLE_LABELS[profile.role]} />
              <Fact label="Position" value={profile.position ?? "—"} />
              <Fact label="Member since" value={format(new Date(profile.created_at), "d MMMM yyyy")} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Your committee and position are set by the Executive Committee. Ask them if these need changing.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phone app</CardTitle>
            </CardHeader>
            <CardContent>
              <InstallAppCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
