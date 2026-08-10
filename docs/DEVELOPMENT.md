# Development

Requires Node.js 22+ and npm. Copy `.env.example` to `.env.local`, then add Supabase and Paystack credentials. Commands: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run start`.

Apply Supabase migrations in lexical order using the Supabase CLI (`npx supabase db push` for a linked development project) or the SQL editor. Keep migrations immutable after shared use. TypeScript is strict; use `@/` imports; React components are PascalCase and utility/domain modules use kebab-case. Run lint, typecheck, tests, and build before completing a phase.
