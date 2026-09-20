# Access control model

Authorization is enforced twice: Server Actions check the signed-in account and
Postgres Row Level Security is the final boundary. Hiding a navigation link is
never treated as authorization.

| Identity | Public/own account | Assigned Club content | Assigned Club governance | School content CMS | Accounts, roles, audit |
| --- | --- | --- | --- | --- | --- |
| Student | Yes | No | No | No | No |
| Club Officer | Yes | Yes, during the active term | No | No | No |
| Advisor | Yes | Yes, assigned Clubs only | Yes, assigned Clubs only | No | No |
| Staff | Yes | All Clubs | All Clubs | Yes | No |
| Admin | Yes | All Clubs | All Clubs | Yes | Yes |

Club Officer is a Club-scoped appointment in `club_officers`, not a global
profile role. Advisor authority requires both an Advisor/Teacher account and an
assignment in `club_advisors`. Staff and Admin authority must not create fake
Advisor rows. Optional custom roles can delegate `clubs.manage`,
`clubs.govern`, or `site.manage`; they never grant Admin authority.

School content CMS includes public site copy, announcements, events,
opportunities, Support operations, and the approval workflows. Club content is
managed through the assigned Club workspace. Students can only maintain their
own account activity, requests, registrations, and memberships.
