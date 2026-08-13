# Admin

Admin login is at `/admin/login` and uses Supabase email/password authentication through a server action. All other `/admin/*` routes require both a valid Supabase session and an `admin_users` row whose `user_id` equals the authenticated user's `auth.uid()`. A signed-in non-admin is signed out and receives the same generic sign-in failure as an invalid login. The proxy and a server-rendered protected layout both enforce this; database RLS independently protects data. The current protected page is intentionally only an authorization-foundation placeholder.

Expired, revoked, or otherwise invalid refresh-token sessions are recovered in the proxy by clearing that project's Supabase SSR cookie chunks and treating the request as signed out. Valid sessions are not broadly cleared.

To authorize an administrator after migrations are applied: create the user in Supabase Auth, then insert that user's UUID into `public.admin_users` from the SQL Editor or another privileged administrative connection. Do not expose a public UI for this operation. Planned sections are dashboard, orders, products, categories, customers, and settings.

Admins will manage products/categories, archive rather than delete catalogue records, update order statuses, inspect payment/fulfillment information, and configure business name, contact number, delivery fee, pickup information, low-stock threshold, and currency. The UI and server routes must enforce the same authorization rule.
