# ARCHITECTURE.md

## Stack
- Next.js (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- OpenAI API
- Zod for validation
- `unpdf` for PDF text extraction
- Upstash Redis (rate limiting)
- Vitest (unit and integration tests)

## High-Level Flow

1. User signs in via Supabase Auth (OAuth)
2. User uploads a `.txt`/`.pdf` file or pastes text directly
3. API authenticates the request and extracts the user ID from the session
4. API extracts text from file (if uploaded) via `unpdf` or reads raw text
5. API validates extracted text (length bounds)
6. Service calls LLM with extracted text
7. Response is parsed and validated against schema
8. Data is stored in DB scoped to the authenticated user
9. UI displays structured result
10. History is available and searchable, scoped to the current user

## Layers

### UI
- Handles input, loading, display, and interactions
- Redirects unauthenticated users to sign-in page

### API
- Handles HTTP requests
- Authenticates requests via Supabase session
- Validates input
- Calls services

### Services
- File text extraction (unpdf / raw text)
- LLM interaction
- Prompt construction
- Response parsing

### Database
- Stores summaries scoped to users
- Handles queries for history and search
- Row Level Security (RLS) enforces per-user data isolation at the DB level

## Auth Flow

- Provider: Supabase Auth (email/password and GitHub OAuth)
- Session is stored in cookies via Supabase SSR helpers
- Proxy refreshes the session on every request and redirects unauthenticated users
- API routes extract the user from the session using `@supabase/ssr` and return 401 if unauthenticated
- Supports sign-up with email confirmation, forgot password, and password reset flows

## Testing

- Framework: Vitest
- Scope: API route integration tests
- Covers: auth guards (401 on all protected endpoints), IDOR protection, rate limiting, and happy path for summarize

## Database Schema

```
summaries
  id             serial    primary key
  user_id        uuid      not null  -- references auth.users(id)
  title          text      not null  -- filename or truncated input preview
  original_input text      not null
  summary        text      not null
  bullet_points  jsonb     not null
  action_items   jsonb     not null
  created_at     timestamp not null default now()
```

### Row Level Security

RLS is enabled on the `summaries` table. Users can only read, insert, and delete their own rows:

```sql
create policy "users can manage their own summaries"
  on summaries
  for all
  using (user_id = auth.uid());
```

## LLM Output Schema

The LLM must return valid JSON matching this shape (enforced with Zod):

```ts
{
  summary: string        // short paragraph
  bulletPoints: string[] // concise list items
  actionItems: string[]  // actionable tasks
}
```

## Key Decisions

- Keep a single main entity: summaries
- Avoid multiple tables unless necessary
- Store bullet points and action items as JSON
- Keep API simple and predictable
- Search performs case-insensitive substring match against `title`, `summary`, and `original_input` using `ILIKE`
- Accepted file types: `.txt`, `.pdf` (reject others with 400)
- Max file size: 4MB (reject with 413)
- Rate limiting on `POST /api/summarize` via Upstash Redis (10 requests/min per IP)
- Supabase used for both auth and database to minimize infrastructure complexity

## API Error Shape

All API errors return `{ error: string }` with an appropriate HTTP status code.

## Non-Goals (for this MVP)

- File storage complexity
- Distributed systems
- Advanced search engines
