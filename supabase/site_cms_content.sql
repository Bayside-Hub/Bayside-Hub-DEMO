-- Expands the audited public-content editor beyond the original four snippets.
-- Run after custom_permissions.sql and editable_support_content.sql.
begin;

alter table public.site_content drop constraint if exists site_content_key_check;
alter table public.site_content drop constraint if exists site_content_body_check;
alter table public.site_content add constraint site_content_key_check check (key in (
  'site_name','home_title','home_intro','home_cta_label',
  'about_intro','about_heading','about_body',
  'about_card_1_title','about_card_1_body','about_card_2_title','about_card_2_body','about_card_3_title','about_card_3_body',
  'support_heading','support_intro','support_response_time','support_location','support_faqs','manual_content',
  'footer_note','footer_contact'
));
alter table public.site_content add constraint site_content_body_check check (
  char_length(body) <= 4000 and (char_length(body) >= 1 or key in ('support_location','footer_contact'))
);

insert into public.site_content(key, body) values
  ('site_name','Bayside Hub'),
  ('home_title','Anchored in Excellence'),
  ('home_cta_label','Explore'),
  ('about_heading','Anchored in Excellence'),
  ('about_body','Bayside Hub is Bayside High School''s one-stop platform for activities, clubs, events, and opportunities — built by students, for students. We keep every announcement, meeting, and deadline in one place so you never miss out.'),
  ('about_card_1_title','Everything in one place'),
  ('about_card_1_body','Announcements, club listings, calendars, and opportunities — a single source of truth for school life.'),
  ('about_card_2_title','Built by students'),
  ('about_card_2_body','Developed and maintained by the Bayside student dev team, guided by advisors and the S.O. office.'),
  ('about_card_3_title','Open to every Baysider'),
  ('about_card_3_body','Every Baysider can browse, join clubs, and find opportunities with their NYC school account.'),
  ('support_heading','We are here to help!'),
  ('support_response_time','Average response time: within two school days.'),
  ('support_location','For in-person help, visit the S.O. office in Room 131.'),
  ('footer_contact','')
on conflict (key) do nothing;

drop policy if exists "Manage site content" on public.site_content;
create policy "Manage site content" on public.site_content for all
using(public.is_staff_or_admin() or public.has_custom_permission('site.manage',null))
with check(public.is_staff_or_admin() or public.has_custom_permission('site.manage',null));

-- CMS writes outside announcements should be visible in the management audit.
drop trigger if exists events_global_audit on public.events;
create trigger events_global_audit after insert or update or delete on public.events
for each row execute function public.audit_management_change();
drop trigger if exists opportunities_global_audit on public.opportunities;
create trigger opportunities_global_audit after insert or update or delete on public.opportunities
for each row execute function public.audit_management_change();

commit;
