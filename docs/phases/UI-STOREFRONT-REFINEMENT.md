# Storefront UI refinement

## Scope

This is an unnumbered visual refinement, not a commerce phase. It makes the existing storefront denser, more product-focused, and mobile-first without changing data access, routes, catalogue queries, cart/checkout/order/payment behavior, database schema, authentication, RLS, or GSAP infrastructure. Phase 9 is not started and CI/CD remains deferred.

## Design goals

The storefront retains the Cream/Ivory/Espresso system and editorial typography while reducing decorative empty space. The intended feel is compact, premium, modern, and fast: products and filters should reach the viewport quickly without sacrificing readable hierarchy, focus states, or touch targets.

## Responsive grid rules

Homepage featured products and every `/shop` result state use the shared `ProductGrid`. It is exactly two columns at mobile, tablet, and desktop sizes. Cards remain compact enough for a narrow two-column mobile layout; no three-, four-, five-, or six-column catalogue variant is introduced.

## Spacing philosophy

Section rhythm uses a compact shared scale rather than very tall hero/section blocks. Heading-to-content spacing, grid gaps, card padding, filter spacing, footer padding, and header height are tightened selectively. Content remains grouped and legible; administrative forms and operational screens are not redesigned.

## Navigation and mobile behavior

Desktop/tablet show the primary navigation and contact action. Mobile shows the brand, cart, and an accessible hamburger; the hamburger is hidden at the `md` breakpoint and above using CSS responsive classes. The existing stateful menu remains a short in-flow disclosure with keyboard-operable links and compact touch targets, rather than a blank full-screen surface.

## Product cards

Cards prioritize square product media, category, product name, price, stock state, and a restrained detail link. Their media `sizes` declaration matches the permanent two-column layout. Borders, surface contrast, and restrained elevation retain the warm visual system without turning metadata or controls into pills.

## Accessibility and performance

Layout responsiveness uses Tailwind CSS classes, never JavaScript viewport detection. Semantic navigation, menu `aria-expanded`/`aria-controls`, focus rings, readable contrast, and touch-safe controls remain. Catalogue pages stay server-rendered; no dependency or client component is added. Existing GSAP page/section reveal behavior is retained and still respects `prefers-reduced-motion`; product cards do not receive per-card animation.

## Verification

Source/class inspection verifies the two-column shared product grid, mobile-only hamburger, desktop navigation at `md`, compact spacing classes, and unchanged data/mutation modules. Local lint, typecheck, tests, production build, and diff checks are required. Browser visual verification is reported only if a browser surface is available.
