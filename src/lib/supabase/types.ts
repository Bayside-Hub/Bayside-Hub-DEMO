export type Role = "student" | "teacher" | "advisor" | "staff" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
};

export type Database = {
  public: {
    Tables: {
      management_audit: TableDefinition<{ id: string; actor_id: string | null; resource: string; operation: string; before_data: unknown; after_data: unknown; created_at: string }>;
      account_role_audit: TableDefinition<{ id: string; actor_id: string | null; profile_id: string | null; previous_role: string | null; new_role: string | null; club_id: string | null; created_at: string }>;
      custom_roles: TableDefinition<{ id: string; name: string; permissions: string[]; created_at: string }>;
      custom_role_assignments: TableDefinition<{ id: string; role_id: string; profile_id: string; club_id: string | null; created_at: string }>;
      site_content: TableDefinition<{ key: string; body: string; updated_by: string | null; updated_at: string }>;
      school_announcement_submissions: TableDefinition<{ id: string; club_id: string; author_id: string; title: string; body: string; media_id: string | null; status: string; review_note: string | null; created_at: string }>;
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      announcements: {
        Row: AnnouncementRow;
        Insert: Partial<AnnouncementRow>;
        Update: Partial<AnnouncementRow>;
        Relationships: [];
      };
      club_applications: {
        Row: ClubApplicationRow;
        Insert: Partial<ClubApplicationRow>;
        Update: Partial<ClubApplicationRow>;
        Relationships: [];
      };
      club_interests: {
        Row: ClubInterestRow;
        Insert: Partial<ClubInterestRow>;
        Update: Partial<ClubInterestRow>;
        Relationships: [];
      };
      event_rsvps: {
        Row: EventRsvpRow;
        Insert: Partial<EventRsvpRow>;
        Update: Partial<EventRsvpRow>;
        Relationships: [];
      };
      clubs: TableDefinition<ClubRow>;
      club_officers: TableDefinition<ClubOfficerRow>;
      club_advisors: TableDefinition<ClubAdvisorRow>;
      club_meetings: TableDefinition<ClubMeetingRow>;
      club_memberships: TableDefinition<ClubMembershipRow>;
      club_media: TableDefinition<ClubMediaRow>;
      club_announcements: TableDefinition<ClubAnnouncementRow>;
      club_messages: TableDefinition<ClubMessageRow>;
      club_attendance_sessions: TableDefinition<ClubAttendanceSessionRow>;
      club_attendance_records: TableDefinition<ClubAttendanceRecordRow>;
      announcement_versions: TableDefinition<AnnouncementVersionRow>;
      events: TableDefinition<EventRow>;
      opportunities: TableDefinition<OpportunityRow>;
      support_requests: TableDefinition<SupportRequestRow>;
      support_request_updates: TableDefinition<SupportRequestUpdateRow>;
      club_audit_log: TableDefinition<ClubAuditLogRow>;
      club_compliance: TableDefinition<ClubComplianceRow>;
    };
    Views: {
      approved_clubs: {
        Row: ApprovedClubRow;
        Relationships: [];
      };
    };
    Functions: {
      get_managed_club_ids: { Args: Record<string, never>; Returns: string[] };
      has_custom_permission: { Args: { p_permission: string; p_club_id?: string | null }; Returns: boolean };
      can_manage_club: { Args: { p_club_id: string }; Returns: boolean };
      can_govern_club: { Args: { p_club_id: string }; Returns: boolean };
      assign_account_role: { Args: { p_user_id: string; p_role: string; p_club_id?: string | null }; Returns: undefined };
      review_school_announcement: { Args: { p_id: string; p_approve: boolean; p_note: string }; Returns: undefined };
      set_user_role: {
        Args: { p_user_id: string; p_role: Role };
        Returns: undefined;
      };
      club_interest_count: {
        Args: { p_slug: string };
        Returns: bigint;
      };
      event_rsvp_count: {
        Args: { p_event_id: string };
        Returns: bigint;
      };
      can_access_club_chat: {
        Args: { p_club_id: string };
        Returns: boolean;
      };
      get_club_chat_messages: {
        Args: { p_club_id: string; p_limit?: number };
        Returns: ClubChatMessage[];
      };
      check_in_to_club: {
        Args: { p_code: string };
        Returns: ClubCheckInResult[];
      };
      get_club_attendance_records: {
        Args: { p_club_id: string; p_limit?: number };
        Returns: ClubAttendanceRecordDetail[];
      };
      get_my_club_attendance: { Args: { p_limit?: number }; Returns: MyClubAttendance[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type AnnouncementRow = {
  id: string;
  title: string;
  tag: string;
  body: string;
  created_by: string | null;
  created_at: string;
  published: boolean;
  archived_at: string | null;
  effective_date: string | null;
  updated_at: string;
  updated_by: string | null;
  version_note: string | null;
  media_id: string | null;
};

export type ClubApplicationRow = {
  id: string;
  club_name: string;
  category: string;
  description: string;
  meeting_days: string | null;
  contact_email: string | null;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type ApprovedClubRow = Pick<
  ClubApplicationRow,
  "id" | "club_name" | "category" | "description" | "meeting_days" | "created_at"
>;
export type ClubInterestRow = {
  id: string;
  user_id: string;
  club_slug: string;
  created_at: string;
};

export type EventRsvpRow = {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
};

type TableDefinition<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type ClubRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  interest_tags: string[];
  is_stem: boolean;
  is_community_service: boolean;
  active_start_date: string | null;
  active_end_date: string | null;
  google_classroom_code: string | null;
  contact_email: string | null;
  join_policy: "instant" | "approval_required";
  status: "draft" | "published" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClubOfficerRow = {
  id: string;
  club_id: string;
  profile_id: string | null;
  display_name: string | null;
  title: string;
  term_start: string | null;
  term_end: string | null;
  created_at: string;
};

export type ClubAdvisorRow = {
  id: string;
  club_id: string;
  profile_id: string;
  display_name: string | null;
  contact_email: string | null;
  created_at: string;
};

export type ClubMeetingRow = {
  id: string;
  club_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  recurrence_note: string | null;
  created_at: string;
};

export type ClubMembershipRow = {
  id: string;
  club_id: string;
  profile_id: string;
  status: "pending" | "active" | "rejected" | "left";
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type ClubMediaRow = {
  id: string;
  club_id: string;
  media_type: "image" | "video" | "document";
  storage_path: string;
  title: string | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
  visibility: "private" | "gallery";
  is_cover: boolean;
};

export type ClubAnnouncementRow = {
  id: string;
  club_id: string;
  title: string;
  body: string;
  published: boolean;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  media_id: string | null;
};

export type ClubMessageRow = {
  id: string;
  club_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ClubChatMessage = ClubMessageRow & {
  author_name: string;
  author_avatar_url: string | null;
  can_delete: boolean;
};

export type ClubAttendanceSessionRow = {
  id: string;
  club_id: string;
  label: string;
  code: string;
  code_type: "temporary" | "permanent";
  expires_at: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
};

export type ClubAttendanceRecordRow = {
  id: string;
  session_id: string;
  club_id: string;
  profile_id: string;
  checked_in_at: string;
};

export type ClubAttendanceRecordDetail = {
  id: string;
  session_id: string;
  session_label: string;
  profile_id: string;
  member_name: string;
  checked_in_at: string;
};

export type MyClubAttendance = { id: string; session_label: string; club_name: string; club_slug: string; checked_in_at: string };

export type ClubCheckInResult = {
  result: "unauthenticated" | "invalid" | "not_member" | "checked_in" | "already_checked_in";
  message: string;
  club_slug: string | null;
  session_label: string | null;
};

export type AnnouncementVersionRow = {
  id: string;
  announcement_id: string;
  version_number: number;
  snapshot_title: string;
  snapshot_content: string;
  snapshot_tag: string;
  changed_by: string | null;
  changed_at: string;
  version_note: string | null;
};

export type EventRow = {
  id: string;
  title: string;
  description: string;
  event_type: "school" | "club" | "sports" | "festival" | "spirit_week" | "other";
  club_id: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  price_label: string;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OpportunityRow = {
  id: string;
  title: string;
  category: "election" | "community_service" | "internship" | "pre_college" | "scholarship" | "discount";
  description: string;
  eligibility: string | null;
  application_link: string | null;
  deadline: string | null;
  status: "draft" | "in_review" | "published" | "expired" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportRequestRow = {
  id: string;
  request_type: "technical" | "club_support" | "room_reservation" | "funding" | "fundraising_finance" | "charter";
  submitted_by: string;
  assigned_to: string | null;
  status: "open" | "in_review" | "resolved" | "closed";
  subject: string;
  details: string;
  requested_for: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportRequestUpdateRow = {
  id: string;
  request_id: string;
  author_id: string;
  body: string;
  internal: boolean;
  created_at: string;
};

export type ClubAuditLogRow = {
  id: string;
  club_id: string;
  actor_id: string | null;
  action: "insert" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

export type ClubComplianceRow = {
  id: string;
  club_id: string;
  school_year: string;
  roster_count: number;
  constitution_on_file: boolean;
  college_alignment_on_file: boolean;
  annual_event_completed: boolean;
  community_service_completed: boolean;
  fundraiser_completed: boolean;
  updated_by: string | null;
  updated_at: string;
};
