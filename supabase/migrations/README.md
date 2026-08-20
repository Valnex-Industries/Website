# Migrations

`0001_inquiries.sql` lives here because it predates the portal and the website
is the only thing that writes to that table.

Everything from `0002` onward lives in
[`../../../Analytics-Portal/supabase/migrations`](../../../Analytics-Portal/supabase/migrations)
— products, news, subscribers, campaigns, analytics events and WhatsApp
inquiries are all owned by the portal, which is the app that manages them.

Both folders target **one** Supabase project and share **one** number sequence,
so do not add a `0002` here. `0002` also alters `inquiries` (adding `notes`,
`assigned_to` and `updated_at`) and adds the staff read policy this file's
header said should exist "when an internal dashboard is built".

See [`../../../Analytics-Portal/supabase/README.md`](../../../Analytics-Portal/supabase/README.md)
for how to apply them and how to create the first portal user.
