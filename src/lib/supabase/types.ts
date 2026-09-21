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
      management_audit: TableDefinition<{ id: string; actor_id: string | null; resource: string; operation: string; before_data: unknown; after_data: unknown; search_text: string; search_vector: string; created_at: string }>;
      search_analytics: TableDefinition<SearchAnalyticsRow>;
      system_errors: TableDefinition<SystemErrorRow>;
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
      club_links: TableDefinition<ClubLinkRow>;
      club_meetings: TableDefinition<ClubMeetingRow>;
      club_memberships: TableDefinition<ClubMembershipRow>;
      club_membership_history: TableDefinition<ClubMembershipHistoryRow>;
      club_media: TableDefinition<ClubMediaRow>;
      club_announcements: TableDefinition<ClubAnnouncementRow>;
      club_messages: TableDefinition<ClubMessageRow>;
      club_attendance_sessions: TableDefinition<ClubAttendanceSessionRow>;
      club_attendance_records: TableDefinition<ClubAttendanceRecordRow>;
      club_share_links: TableDefinition<ClubShareLinkRow>;
      announcement_versions: TableDefinition<AnnouncementVersionRow>;
      announcement_drafts: TableDefinition<AnnouncementDraftRow>;
      events: TableDefinition<EventRow>;
      opportunities: TableDefinition<OpportunityRow>;
      support_requests: TableDefinition<SupportRequestRow>;
      support_request_updates: TableDefinition<SupportRequestUpdateRow>;
      club_audit_log: TableDefinition<ClubAuditLogRow>;
      club_compliance: TableDefinition<ClubComplianceRow>;
      club_finance_transactions: TableDefinition<ClubFinanceTransactionRow>;
      club_fundraisers: TableDefinition<ClubFundraiserRow>;
      club_trips: TableDefinition<ClubTripRow>;
      trip_consents: TableDefinition<TripConsentRow>;
      club_constitution_versions: TableDefinition<ConstitutionVersionRow>;
      club_elections: TableDefinition<ClubElectionRow>;
      club_budgets: TableDefinition<ClubBudgetRow>;
      club_reimbursements: TableDefinition<ClubReimbursementRow>;
      facility_permits: TableDefinition<FacilityPermitRow>;
      event_approval_requests: TableDefinition<EventApprovalRow>;
      event_registrations: TableDefinition<EventRegistrationRow>;
      analytics_events: TableDefinition<AnalyticsEventRow>;
      election_candidates: TableDefinition<ElectionCandidateRow>;
      election_ballots: TableDefinition<ElectionBallotRow>;
      permit_approvals: TableDefinition<PermitApprovalRow>;
      notifications: TableDefinition<NotificationRow>;
      notification_outbox: TableDefinition<{ id: number; notification_id: string; channel: "email"; status: string; attempts: number; available_at: string; last_error: string | null; sent_at: string | null }>;
      club_import_batches: TableDefinition<ClubImportBatchRow>;
      club_import_rows: TableDefinition<ClubImportRow>;
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
      resolve_club_share_link: { Args: { p_id: string }; Returns: { club_id: string }[] };
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
      reply_to_membership_decision: { Args: { p_membership_id: string; p_reply: string }; Returns: boolean };
      record_search_analytics: { Args: { p_query: string; p_result_count: number }; Returns: undefined };
      record_system_error: { Args: { p_source: string; p_message: string; p_context?: Record<string, unknown> }; Returns: undefined };
      can_approve_club_finance: { Args: { p_club_id: string }; Returns: boolean };
      review_club_fundraiser: { Args: { p_fundraiser_id: string; p_approve: boolean; p_note: string }; Returns: boolean };
      close_club_fundraiser: { Args: { p_fundraiser_id: string; p_statement: string; p_proceeds_cents: number; p_expenses_cents: number }; Returns: boolean };
      record_analytics_event: { Args: { p_event_name: string; p_route?: string | null; p_entity_id?: string | null; p_metric_value?: number | null; p_metadata?: Record<string, unknown>; p_session_id?: string | null }; Returns: undefined };
      register_for_event: { Args: { p_approval_id: string }; Returns: string };
      cancel_event_registration: { Args: { p_registration_id: string }; Returns: string };
      cast_election_vote: { Args: { p_election_id: string; p_position: string; p_candidate_id: string }; Returns: undefined };
      lock_election_results: { Args: { p_election_id: string }; Returns: unknown };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SearchAnalyticsRow = {
  id: number;
  query: string;
  normalized_query: string;
  result_count: number;
  user_id: string | null;
  created_at: string;
};

export type SystemErrorRow = {
  id: number;
  source: string;
  message: string;
  context: Record<string, unknown>;
  resolved_at: string | null;
  created_at: string;
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
  publish_at: string | null;
};

export type AnnouncementDraftRow = { user_id: string; draft_key: string; title: string; tag: string; body: string; publish_at: string | null; updated_at: string };

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
  recruiting_status: "recruiting" | "paused" | "closed";
  status: "draft" | "published" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: string | null;
  school_year?: string | null;
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
export type ClubLinkRow = {
  id: string;
  club_id: string;
  platform: "google_classroom" | "instagram" | "discord" | "whatsapp" | "youtube" | "tiktok" | "website" | "other";
  label: string;
  value: string;
  sort_order: number;
  created_by: string | null;
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
  rejection_reason: string | null;
  member_reply: string | null;
  ended_at: string | null;
};

export type ClubMembershipHistoryRow = {
  id: string;
  membership_id: string;
  club_id: string;
  profile_id: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
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

export type ClubShareLinkRow = {
  id: string;
  club_id: string;
  label: string;
  expires_at: string;
  active: boolean;
  created_by: string;
  created_at: string;
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

export type ClubFinanceTransactionRow = {
  id: string;
  club_id: string;
  school_year: string;
  entry_type: "income" | "expense";
  amount_cents: number;
  category: string;
  description: string;
  occurred_on: string;
  receipt_reference: string | null;
  fundraiser_id: string | null;
  created_by: string;
  created_at: string;
};

export type ClubFundraiserRow = {
  id: string;
  club_id: string;
  school_year: string;
  title: string;
  purpose: string;
  target_cents: number;
  planned_start: string;
  planned_end: string;
  status: "pending_treasurer" | "approved" | "rejected" | "final_statement_due" | "closed";
  submitted_by: string;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  final_statement_due_at: string;
  final_statement: string | null;
  proceeds_cents: number | null;
  expenses_cents: number | null;
  closed_by: string | null;
  closed_at: string | null;
};

export type ClubTripRow = { id: string; club_id: string; title: string; trip_date: string; destination: string; plan: string; consent_required: boolean; status: "draft" | "submitted" | "approved" | "rejected" | "completed"; submitted_by: string; reviewed_by: string | null; review_note: string | null; created_at: string };
export type TripConsentRow = { id: string; trip_id: string; profile_id: string; status: "pending" | "received" | "declined" | "not_required"; guardian_name: string | null; guardian_email: string | null; guardian_signature: string | null; signed_at: string | null; document_path: string | null; due_at: string | null; reminder_sent_at: string | null; updated_by: string | null; updated_at: string };
export type ConstitutionVersionRow = { id: string; club_id: string; version_number: number; body: string; change_summary: string; adopted_on: string | null; created_by: string; created_at: string };
export type ClubElectionRow = { id: string; club_id: string; title: string; election_date: string; positions: string[]; status: "planned" | "open" | "completed" | "cancelled"; result_summary: string | null; opens_at: string | null; closes_at: string | null; results_locked_at: string | null; created_by: string; created_at: string };
export type ClubBudgetRow = { id: string; club_id: string; school_year: string; allocated_cents: number; notes: string | null; updated_by: string; updated_at: string };
export type ClubReimbursementRow = { id: string; club_id: string; school_year: string; amount_cents: number; purpose: string; receipt_reference: string; receipt_path: string | null; status: "pending" | "approved" | "rejected" | "paid"; submitted_by: string; reviewed_by: string | null; review_note: string | null; created_at: string };
export type FacilityPermitRow = { id: string; club_id: string | null; event_id: string | null; title: string; event_date: string; start_time: string | null; end_time: string | null; room: string | null; needs_security: boolean; needs_library: boolean; needs_av: boolean; room_status: string; security_status: string; library_status: string; av_status: string; overall_status: "pending" | "approved" | "rejected"; submitted_by: string; review_note: string | null; created_at: string };
export type EventApprovalRow = { id: string; club_id: string | null; title: string; description: string; start_at: string; end_at: string | null; location: string | null; capacity: number | null; status: "pending" | "approved" | "rejected"; submitted_by: string; reviewed_by: string | null; review_note: string | null; created_at: string };
export type EventRegistrationRow = { id: string; approval_id: string; profile_id: string; status: "pending" | "approved" | "waitlisted" | "rejected" | "cancelled"; reviewed_by: string | null; review_note: string | null; created_at: string };
export type AnalyticsEventRow = { id: number; event_name: string; route: string | null; entity_id: string | null; metric_value: number | null; metadata: Record<string, unknown>; user_id: string | null; session_id: string | null; created_at: string };
export type ElectionCandidateRow = { id: string; election_id: string; profile_id: string; position: string; statement: string | null; status: "pending" | "approved" | "withdrawn" | "disqualified"; created_at: string };
export type ElectionBallotRow = { id: string; election_id: string; voter_id: string; position: string; candidate_id: string; created_at: string };
export type PermitApprovalRow = { id: string; permit_id: string; department: "room" | "security" | "library" | "av"; step_order: number; assigned_to: string | null; status: "pending" | "approved" | "rejected" | "skipped"; note: string | null; decided_by: string | null; decided_at: string | null; created_at: string };
export type NotificationRow = { id: string; user_id: string; kind: string; title: string; body: string; href: string | null; read_at: string | null; dedupe_key: string | null; created_at: string };
export type ClubImportBatchRow = { id: string; created_by: string; file_name: string; status: "preview" | "applied" | "rolled_back" | "failed"; total_rows: number; valid_rows: number; error_rows: number; created_at: string; applied_at: string | null; rolled_back_at: string | null };
export type ClubImportRow = { id: number; batch_id: string; row_number: number; payload: Record<string,string>; errors: string[]; before_state: Record<string,unknown> | null; club_id: string | null; action: "insert" | "update" | null };
