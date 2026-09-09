# Navigation design

Reference: [Figma sidebar 1:3341](https://www.figma.com/design/y1TgapAAMxhLfhmDH3zMYM/Sidebar-design-for-Admin-Dashboard--Community-?node-id=1-3341).

- Desktop uses a fixed 90px plum rail, grouped links and native top-layer popovers.
- Preserve Bayside branding, real account initials and existing role-filtered destinations.
- Search focuses the existing search field. The sun control increases navigation contrast only; it does not claim to change the entire site's theme.
- Below 1024px, retain the labelled mobile drawer with keyboard focus management.
- Short desktop windows scroll navigation independently; popovers are height-limited, close on rail scroll/resize and support Escape/click-outside dismissal.
- Icons in public/navigation are exact Figma exports, stored locally so asset expiry cannot break deployment.

Validation: lint, TypeScript, 25 existing unit tests and production build passed after incorporating the latest GitHub changes. Browser checks covered desktop popover hit-testing over content, icon loading, search focus, Escape dismissal, mobile submenu expansion and horizontal overflow at 390px and 1280px. These UI checks do not replace authenticated role and production Supabase integration testing.
