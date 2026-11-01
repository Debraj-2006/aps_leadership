import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { RoleSelect } from "@/components/admin/role-select";
import { ActiveToggleButton } from "@/components/admin/active-toggle-button";
import { getAllProfiles } from "@/lib/actions/users";
import { getCurrentProfile } from "@/lib/auth";
import { canApprovePendingUsers, canManageUsers, ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export default async function UserManagementPage() {
  const { profile } = await getCurrentProfile();
  if (!canApprovePendingUsers(profile.role)) redirect("/dashboard");

  const canEditRoles = canManageUsers(profile.role);
  const profiles = await getAllProfiles();
  const pendingCount = profiles.filter((p) => !p.is_active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={
          pendingCount > 0
            ? `${pendingCount} account${pendingCount === 1 ? "" : "s"} awaiting approval.`
            : "Approve new members and manage access levels across the chapter platform."
        }
        actions={canEditRoles ? <CreateUserDialog /> : undefined}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Membership No.</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => {
                  const initials = p.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-tight">{p.full_name}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                            {p.position && <p className="text-xs font-medium text-primary">{p.position}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.ieee_membership_no ?? "—"}
                      </TableCell>
                      <TableCell>
                        {canEditRoles ? (
                          <RoleSelect profileId={p.id} role={p.role} />
                        ) : (
                          <Badge variant="outline">{ROLE_LABELS[p.role as UserRole]}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.is_active ? "default" : "outline"}>
                          {p.is_active ? "Active" : "Pending / Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActiveToggleButton profileId={p.id} isActive={p.is_active} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
