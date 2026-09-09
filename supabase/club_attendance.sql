-- Club activity quick check-in with temporary or reusable codes.
-- Apply after club_governance.sql.

create table if not exists public.club_attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 3 and 120),
  code text not null check (code ~ '^[A-Z0-9]{8}$'),
  code_type text not null check (code_type in ('temporary', 'permanent')),
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  check (
    (code_type = 'temporary' and expires_at is not null)
    or (code_type = 'permanent' and expires_at is null)
  )
);

create unique index if not exists club_attendance_sessions_code_idx
  on public.club_attendance_sessions (upper(code));
create index if not exists club_attendance_sessions_club_created_idx
  on public.club_attendance_sessions (club_id, created_at desc);

create table if not exists public.club_attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.club_attendance_sessions (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (session_id, profile_id)
);

alter table public.club_attendance_sessions enable row level security;
alter table public.club_attendance_records enable row level security;

drop policy if exists "Managers manage attendance sessions" on public.club_attendance_sessions;
drop policy if exists "Managers read attendance sessions" on public.club_attendance_sessions;
drop policy if exists "Managers create attendance sessions" on public.club_attendance_sessions;
drop policy if exists "Managers update attendance sessions" on public.club_attendance_sessions;
drop policy if exists "Managers delete attendance sessions" on public.club_attendance_sessions;
create policy "Managers read attendance sessions" on public.club_attendance_sessions for select
  using (public.can_manage_club(club_id));
create policy "Managers create attendance sessions" on public.club_attendance_sessions for insert
  with check (public.can_manage_club(club_id) and created_by = auth.uid());
create policy "Managers update attendance sessions" on public.club_attendance_sessions for update
  using (public.can_manage_club(club_id)) with check (public.can_manage_club(club_id));
create policy "Managers delete attendance sessions" on public.club_attendance_sessions for delete
  using (public.can_manage_club(club_id));

drop policy if exists "Members read own attendance" on public.club_attendance_records;
create policy "Members read own attendance" on public.club_attendance_records for select
  using (profile_id = auth.uid() or public.can_manage_club(club_id));

-- Code redemption is atomic and does not expose active codes to members.
create or replace function public.check_in_to_club(p_code text)
returns table (result text, message text, club_slug text, session_label text)
language plpgsql
security definer set search_path = public
as $$
declare
  target public.club_attendance_sessions%rowtype;
  target_slug text;
begin
  if auth.uid() is null then
    return query select 'unauthenticated', 'Sign in before checking in.', null::text, null::text;
    return;
  end if;

  select s, c.slug into target, target_slug
  from public.club_attendance_sessions s
  join public.clubs c on c.id = s.club_id
  where upper(s.code) = upper(btrim(p_code))
    and s.active
    and (s.expires_at is null or s.expires_at > now())
  limit 1;

  if target.id is null then
    return query select 'invalid', 'That check-in code is invalid or expired.', null::text, null::text;
    return;
  end if;

  if not exists (
    select 1 from public.club_memberships m
    where m.club_id = target.club_id and m.profile_id = auth.uid() and m.status = 'active'
  ) and not public.can_manage_club(target.club_id) then
    return query select 'not_member', 'Only active members of this Club can check in.', target_slug, target.label;
    return;
  end if;

  insert into public.club_attendance_records (session_id, club_id, profile_id)
  values (target.id, target.club_id, auth.uid())
  on conflict (session_id, profile_id) do nothing;

  if found then
    return query select 'checked_in', 'Check-in complete.', target_slug, target.label;
  else
    return query select 'already_checked_in', 'You are already checked in for this activity.', target_slug, target.label;
  end if;
end;
$$;

revoke all on function public.check_in_to_club(text) from public, anon;
grant execute on function public.check_in_to_club(text) to authenticated;
