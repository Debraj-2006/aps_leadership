import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenureFormDialog } from "@/components/tenure/tenure-form-dialog";
import { DeleteTenureButton } from "@/components/tenure/delete-tenure-button";
import { getTenuresWithCounts } from "@/lib/actions/tenure";
import { getCurrentProfile } from "@/lib/auth";
import { canManageTenures } from "@/lib/roles";
import { format } from "date-fns";
import { CalendarRange, Users, CalendarCheck2 } from "lucide-react";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  upcoming: "secondary",
  completed: "outline",
};

export default async function TenurePage() {
  const { profile } = await getCurrentProfile();
  const canManage = canManageTenures(profile.role);
  const tenures = await getTenuresWithCounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenure Management"
        description="Academic-year committees, their timelines, themes and milestones."
        actions={canManage ? <TenureFormDialog /> : undefined}
      />

      {tenures.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No tenures yet. {canManage ? "Create the first one to get started." : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenures.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{t.academic_year}</CardTitle>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarRange className="size-3.5" />
                    {format(new Date(t.start_date), "dd MMM yyyy")} &ndash;{" "}
                    {format(new Date(t.end_date), "dd MMM yyyy")}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[t.status]} className="capitalize">
                  {t.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {t.theme && <p className="text-sm font-medium text-primary">{t.theme}</p>}
                {t.achievements && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{t.achievements}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> {t.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarCheck2 className="size-3.5" /> {t.eventCount} events
                  </span>
                </div>
                {canManage && (
                  <div className="flex justify-end gap-1 border-t pt-3">
                    <TenureFormDialog editing={t} />
                    <DeleteTenureButton id={t.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
