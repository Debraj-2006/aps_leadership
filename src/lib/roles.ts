import type { UserRole } from "@/lib/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  faculty_advisor: "Faculty Advisor",
  executive: "Executive Committee",
  core: "Core Committee",
  working: "Working Committee",
};

// Roles that can self-register via the signup form. Super Admin and Faculty
// Advisor are institutional roles and stay admin-assigned only.
export const SIGNUP_ROLES: UserRole[] = ["executive", "core", "working"];

// Full administrative access: leadership, handover approvals, etc.
export const ADMIN_ROLES: UserRole[] = ["super_admin", "faculty_advisor", "executive"];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canManageLeadership(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canManageEvents(role: UserRole): boolean {
  return isAdminRole(role) || role === "core";
}

export function canUploadDocuments(): boolean {
  return true;
}

export function canManageUsers(role: UserRole): boolean {
  return role === "super_admin";
}

export function canApprovePendingUsers(role: UserRole): boolean {
  return isAdminRole(role);
}

export function canApproveHandover(role: UserRole): boolean {
  return isAdminRole(role);
}

// Executive Committee (plus Super Admin / Faculty Advisor) give points and badges.
export function canAwardRecognition(role: UserRole): boolean {
  return isAdminRole(role);
}

// Point requests: Working members request for Core members or Executives, Core members
// for Working members or Executives, and both can request for themselves.
// An Executive has to approve each request before the points are awarded.
export function peerPointRecipientRoles(role: UserRole): UserRole[] {
  if (role === "working") return ["core", "executive"];
  if (role === "core") return ["working", "executive"];
  return [];
}

// Only Core and Working Committee members receive points and badges.
export const RECOGNITION_RECIPIENT_ROLES: UserRole[] = ["core", "working"];

// Executive Committee assigns tasks to Core and Working; Core assigns only to Working.
export function assignableRolesFor(role: UserRole): UserRole[] {
  if (isAdminRole(role)) return ["core", "working"];
  if (role === "core") return ["working"];
  return [];
}

export function canAssignTasks(role: UserRole): boolean {
  return assignableRolesFor(role).length > 0;
}

// Pages Working Committee members can open: their tasks, their points and badges, the leaderboard and the member list.
export const WORKING_ALLOWED_PATHS = ["/tasks", "/my-recognition", "/leaderboard", "/members"];
export const WORKING_HOME = "/tasks";

// Executive and Core Committee members must state their position when signing up.
export const POSITION_REQUIRED_ROLES: UserRole[] = ["executive", "core"];

// Institutional titles that can't be self-selected at signup.
export const NON_SIGNUP_POSITIONS = ["Faculty Advisor"];

export function roleBadgeVariant(role: UserRole): "default" | "secondary" | "outline" {
  if (role === "super_admin" || role === "faculty_advisor") return "default";
  if (role === "executive") return "secondary";
  return "outline";
}
