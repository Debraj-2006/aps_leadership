import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  ArrowLeftRight,
  UserCog,
  ScrollText,
  Trophy,
  ListChecks,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ADMIN: UserRole[] = ["super_admin", "faculty_advisor", "executive"];

export const NAV_GROUPS: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Committee",
    items: [
      { label: "Leadership", href: "/leadership", icon: Users },
      { label: "Handover", href: "/handover", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Chapter",
    items: [
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Contribution",
    items: [
      { label: "Tasks", href: "/tasks", icon: ListChecks },
      { label: "Points & badges", href: "/recognition", icon: Trophy, roles: ADMIN },
      { label: "My points & badges", href: "/my-recognition", icon: Award, roles: ["core"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "User management", href: "/admin/users", icon: UserCog, roles: ADMIN },
      { label: "Activity log", href: "/admin/activity", icon: ScrollText, roles: ADMIN },
    ],
  },
];

const WORKING_GROUPS: NavGroup[] = [
  {
    label: "Contribution",
    items: [
      { label: "My tasks", href: "/tasks", icon: ListChecks },
      { label: "My points & badges", href: "/my-recognition", icon: Award },
    ],
  },
];

export function visibleNavGroups(role: UserRole): NavGroup[] {
  const groups = role === "working" ? WORKING_GROUPS : NAV_GROUPS;
  return groups
    .map((g) => ({ ...g, items: g.items.filter((item) => !item.roles || item.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function sectionForPath(pathname: string): string | undefined {
  for (const group of [...NAV_GROUPS, ...WORKING_GROUPS]) {
    if (group.items.some((item) => isActivePath(pathname, item.href))) return group.label;
  }
  return undefined;
}
