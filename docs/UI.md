# UI

Brand placeholder: **Campus Accessories**. The implementation uses a dark ink/slate base with electric lime accents, Inter typography, generous rounded cards, and a mobile-first responsive shell. The home page contains a hero, database-backed category cards and featured products, fulfillment panel, and footer.

Use accessible labels, visible focus states, keyboard-operable controls, sufficient contrast, and semantic headings. Customer navigation is Home and Shop; cart navigation is deferred to Phase 4. `/shop` has a responsive search/category/sort form and URL-backed reset state. Product cards clearly show category, database price, availability, and a view-product link—never an add-to-cart control. `/shop/[slug]` shows gallery/fallback image, variants, descriptive text, stock state, and configurable contact CTA. Lucide icons are used for interface symbols; `next/image` is used for configured Supabase Storage assets, with an accessible fallback for missing images.
