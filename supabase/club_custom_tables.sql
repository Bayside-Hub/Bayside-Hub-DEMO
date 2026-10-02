-- Club-scoped custom tables and rows. Run after custom_permissions.sql.
begin;

create table if not exists public.club_custom_tables (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null check(char_length(btrim(name)) between 2 and 80),
  description text check(description is null or char_length(description) <= 500),
  columns jsonb not null check(jsonb_typeof(columns)='array' and jsonb_array_length(columns) between 1 and 30),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(club_id,name)
);

create table if not exists public.club_custom_table_rows (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.club_custom_tables(id) on delete cascade,
  data jsonb not null default '{}' check(jsonb_typeof(data)='object'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create index if not exists club_custom_tables_club_idx on public.club_custom_tables(club_id,created_at);
create index if not exists club_custom_table_rows_table_idx on public.club_custom_table_rows(table_id,created_at desc);
alter table public.club_custom_tables enable row level security;
alter table public.club_custom_table_rows enable row level security;

create or replace function public.validate_club_custom_table_columns() returns trigger
language plpgsql security definer set search_path=public as $$
declare item jsonb; seen text[] := '{}';
begin
  for item in select value from jsonb_array_elements(new.columns) loop
    if jsonb_typeof(item)<>'object'
      or coalesce(item->>'key','') !~ '^column_[1-9][0-9]*$'
      or char_length(btrim(coalesce(item->>'label',''))) not between 1 and 80
      or coalesce(item->>'type','') not in ('text','number','date','checkbox')
      or coalesce(jsonb_typeof(item->'required'),'') <> 'boolean'
      or item->>'key'=any(seen) then
      raise exception 'Invalid custom table column definition' using errcode='23514';
    end if;
    seen := array_append(seen,item->>'key');
  end loop;
  return new;
end $$;
revoke all on function public.validate_club_custom_table_columns() from public,anon,authenticated;
drop trigger if exists validate_club_custom_table_columns on public.club_custom_tables;
create trigger validate_club_custom_table_columns before insert or update of columns on public.club_custom_tables
for each row execute function public.validate_club_custom_table_columns();

create or replace function public.validate_club_custom_table_row() returns trigger
language plpgsql security definer set search_path=public as $$
declare definitions jsonb; item jsonb; cell jsonb; allowed text[] := '{}';
begin
  select columns into definitions from public.club_custom_tables where id=new.table_id;
  if definitions is null then raise exception 'Custom table not found' using errcode='23503'; end if;
  for item in select value from jsonb_array_elements(definitions) loop
    allowed := array_append(allowed,item->>'key');
    cell := new.data->(item->>'key');
    if coalesce((item->>'required')::boolean,false) and (cell is null or cell='""'::jsonb) and item->>'type'<>'checkbox' then
      raise exception 'Required custom table value is missing' using errcode='23514';
    end if;
    if cell is not null and not (
      (item->>'type' in ('text','date') and jsonb_typeof(cell)='string')
      or (item->>'type'='number' and (jsonb_typeof(cell)='number' or cell='""'::jsonb))
      or (item->>'type'='checkbox' and jsonb_typeof(cell)='boolean')
    ) then raise exception 'Custom table value has the wrong type' using errcode='23514'; end if;
  end loop;
  if exists(select 1 from jsonb_object_keys(new.data) key where not key=any(allowed)) then
    raise exception 'Unknown custom table column' using errcode='23514';
  end if;
  return new;
end $$;
revoke all on function public.validate_club_custom_table_row() from public,anon,authenticated;
drop trigger if exists validate_club_custom_table_row on public.club_custom_table_rows;
create trigger validate_club_custom_table_row before insert or update on public.club_custom_table_rows
for each row execute function public.validate_club_custom_table_row();

drop policy if exists "Club managers manage custom tables" on public.club_custom_tables;
drop policy if exists "Club managers read custom tables" on public.club_custom_tables;
drop policy if exists "Club managers create custom tables" on public.club_custom_tables;
drop policy if exists "Club managers delete custom tables" on public.club_custom_tables;
create policy "Club managers read custom tables" on public.club_custom_tables for select using(public.can_manage_club(club_id));
create policy "Club managers create custom tables" on public.club_custom_tables for insert with check(public.can_manage_club(club_id) and created_by=auth.uid());
create policy "Club managers delete custom tables" on public.club_custom_tables for delete using(public.can_manage_club(club_id));

drop policy if exists "Club managers manage custom rows" on public.club_custom_table_rows;
drop policy if exists "Club managers read custom rows" on public.club_custom_table_rows;
drop policy if exists "Club managers create custom rows" on public.club_custom_table_rows;
drop policy if exists "Club managers delete custom rows" on public.club_custom_table_rows;
create policy "Club managers read custom rows" on public.club_custom_table_rows for select
using(exists(select 1 from public.club_custom_tables t where t.id=table_id and public.can_manage_club(t.club_id)));
create policy "Club managers create custom rows" on public.club_custom_table_rows for insert
with check(created_by=auth.uid() and exists(select 1 from public.club_custom_tables t where t.id=table_id and public.can_manage_club(t.club_id)));
create policy "Club managers delete custom rows" on public.club_custom_table_rows for delete
using(exists(select 1 from public.club_custom_tables t where t.id=table_id and public.can_manage_club(t.club_id)));

grant select,insert,delete on public.club_custom_tables,public.club_custom_table_rows to authenticated;

do $$ begin
  if to_regprocedure('public.audit_management_change()') is not null then
    drop trigger if exists club_custom_tables_global_audit on public.club_custom_tables;
    create trigger club_custom_tables_global_audit after insert or update or delete on public.club_custom_tables
      for each row execute function public.audit_management_change();
    drop trigger if exists club_custom_table_rows_global_audit on public.club_custom_table_rows;
    create trigger club_custom_table_rows_global_audit after insert or update or delete on public.club_custom_table_rows
      for each row execute function public.audit_management_change();
  end if;
end $$;

commit;
