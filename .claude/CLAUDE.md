## Basic Instructions

1. use `pnpm` for package management
2. use `gh` for github operations

## Dev Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server (port 3000)
pnpm run build        # Production build
npx supabase start   # Start local Supabase (DB port 54322, API port 54321, Studio port 54323)
```

## Documentation Reference

1. Next.js (FullStack framework)
go through the https://nextjs.org/docs/llms.txt

2. Clerk (Authentication)
Go through the https://clerk.com/llms.txt

3. Supabase (Database)
Go through the https://supabase.com/llms.txt

4. Shadcn (UI Components)
Go through the https://ui.shadcn.com/llms.txt

## Database Operations

Use supabase CLI for database operations.
Some important commands would be:
1. Create migration: `npx supabase migration new <migration-name>`
2. Apply migration: `npx supabase migration up --local`