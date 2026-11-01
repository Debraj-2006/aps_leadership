import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusPill } from "@/components/shared/status-pill";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { RoleSelect } from "@/components/admin/role-select";
import { ActiveToggleButton } from "@/components/admin/active-toggle-button";
import { getAllProfiles } from "@/lib/actions/users";
import { getCurrentProfile } from "@/lib/auth";
import { canApprovePendingUsers, canManageUsers, ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
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
        title="User management"
        description={
          pendingCount > 0
            ? `${pendingCount} account${pendingCount === 1 ? "" : "s"} inactive or awaiting approval.`
            : "Approve new members and manage access levels across the chapter hub."
        }
        actions={canEditRoles ? <CreateUserDialog /> : undefined}
      />

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">User</TableHead>
              <TableHead>IEEE no.</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[11px] font-medium">{initials(p.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-tight">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.email}
                        {p.position ? ` · ${p.position}` : ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="type-readout text-xs text-muted-foreground">{p.ieee_membership_no ?? "—"}</TableCell>
                <TableCell>
                  {canEditRoles ? (
                    <RoleSelect profileId={p.id} role={p.role} />
                  ) : (
                    <span className="text-sm">{ROLE_LABELS[p.role as UserRole]}</span>
                  )}
                </TableCell>
                <TableCell>
                  {p.is_active ? <StatusPill tone="success">Active</StatusPill> : <StatusPill tone="neutral">Inactive</StatusPill>}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <ActiveToggleButton profileId={p.id} isActive={p.is_active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
