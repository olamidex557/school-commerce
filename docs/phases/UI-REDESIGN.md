# UI/UX redesign and motion system

## Scope

Visual and interaction redesign only. Supabase, RLS, authentication, admin authorization, server actions, data queries, routes, and business logic are unchanged. Cart, checkout, Paystack, and orders remain out of scope.

## System

The shared token system lives in `app/globals.css`: Cream `#F7F1E7`, Ivory `#FFFDF8`, Espresso `#5A3825`, Deep Coffee `#432719`, Cocoa `#2C211B`, Taupe `#806F63`, Sand `#E5D8C8`, Caramel `#B98255`, Forest `#3F6249`, and Brick `#9B4A3C`. It uses semantic CSS variables, reusable button/form/surface classes, warm borders, restrained shadows, and a serif-display/system-sans type pairing. Dark mode was intentionally deferred to preserve the deliberate paper-and-espresso identity.

## Motion

GSAP 3.15.0 provides short page reveals and one-time ScrollTrigger section/grid reveals. Motion uses transform and opacity, scoped GSAP contexts, and cleanup. `prefers-reduced-motion` disables non-essential motion and immediately renders content.

## Responsive and accessibility

The storefront has a mobile disclosure navigation and desktop action navigation. The system includes visible focus rings, semantic labels, accessible menu state, keyboard-operable controls, reduced-motion support, and responsive card/form layouts. Browser visual verification remains unavailable in this managed environment.

## Verification

`npm run lint`, `npm run typecheck`, and `npm test` pass (11 test files / 26 tests). `npm run build` passes and confirms the App Router routes compile successfully. The build initially exposed a client/server boundary issue in the new interactive header; it was corrected by separating browser-safe `lib/storefront/public-config.ts` from the server-only storefront configuration. Browser tooling remains unavailable, so a screenshot/mobile/tablet visual audit and live authenticated admin interaction are not claimed.
