# Admin

Admin routes live beneath `/admin` and require a Supabase session. Database authorization additionally requires an `admin_users` record for the authenticated user. Planned sections are dashboard, orders, products, categories, customers, and settings.

Admins will manage products/categories, archive rather than delete catalogue records, update order statuses, inspect payment/fulfillment information, and configure business name, contact number, delivery fee, pickup information, low-stock threshold, and currency. The UI and server routes must enforce the same authorization rule.
