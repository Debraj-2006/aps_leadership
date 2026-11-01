export type UserRole =
  | "super_admin"
  | "faculty_advisor"
  | "executive"
  | "core"
  | "working";

export type TenureStatus = "upcoming" | "active" | "completed";

export type EventType =
  | "technical_talk"
  | "workshop"
  | "webinar"
  | "competition"
  | "seminar"
  | "social"
  | "other";

export type EventStatus = "planned" | "completed" | "cancelled";

export type DocumentCategory =
  | "event_report"
  | "meeting_minutes"
  | "certificate"
  | "financial_report"
  | "handover"
  | "other";

export type DocumentVisibility = "all" | "committee_only" | "admin_only";

export type HandoverStatus = "pending" | "in_progress" | "completed" | "approved";

export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "pending" | "in_progress" | "completed";

export type NotificationType = "deadline" | "approval" | "info" | "handover";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  ieee_membership_no: string | null;
  roll_number: string | null;
  phone: string | null;
  role: UserRole;
  position: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  title: string;
  rank: number;
}

export interface Tenure {
  id: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: TenureStatus;
  theme: string | null;
  achievements: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMember {
  id: string;
  tenure_id: string;
  profile_id: string;
  designation_id: string;
  custom_title: string | null;
  is_outgoing: boolean;
  joined_at: string;
  left_at: string | null;
  created_at: string;
  profile?: Profile;
  designation?: Designation;
  tenure?: Tenure;
}

export interface ChapterEvent {
  id: string;
  tenure_id: string | null;
  title: string;
  type: EventType;
  description: string | null;
  event_date: string;
  venue: string | null;
  speaker: string | null;
  status: EventStatus;
  attendees_count: number;
  banner_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tenure?: Tenure;
}

export interface ChapterDocument {
  id: string;
  tenure_id: string | null;
  event_id: string | null;
  title: string;
  category: DocumentCategory;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  visibility: DocumentVisibility;
  uploaded_by: string | null;
  created_at: string;
  tenure?: Tenure;
  event?: ChapterEvent;
  uploader?: Profile;
}

export interface HandoverRecord {
  id: string;
  from_tenure_id: string | null;
  to_tenure_id: string | null;
  outgoing_profile_id: string | null;
  incoming_profile_id: string | null;
  designation_id: string | null;
  status: HandoverStatus;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  from_tenure?: Tenure;
  to_tenure?: Tenure;
  outgoing_profile?: Profile;
  incoming_profile?: Profile;
  designation?: Designation;
  tasks?: HandoverTask[];
}

export interface HandoverTask {
  id: string;
  handover_record_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile;
}

export interface MemberTask {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string | null;
  event_id: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string; role: UserRole } | null;
  assigner?: { full_name: string; role: UserRole } | null;
  event?: { title: string } | null;
}

export interface PointAward {
  id: string;
  recipient_id: string;
  awarded_by: string | null;
  event_id: string | null;
  points: number;
  reason: string;
  created_at: string;
}

export interface BadgeAward {
  id: string;
  recipient_id: string;
  awarded_by: string | null;
  event_id: string;
  badge: string;
  note: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string | null;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}
