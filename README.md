# Summarizer

A web app that summarizes reports using an LLM. Upload a `.txt` or `.pdf` file, or paste text directly — the app returns a summary, bullet points, and action items. Results are saved per user and are searchable.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Supabase** — auth and PostgreSQL database
- **Drizzle ORM** — schema and queries
- **OpenAI API** — summarization
- **Upstash Redis** — rate limiting
- **Tailwind CSS** + shadcn/ui

## Features

- Email/password and GitHub OAuth authentication
- File upload (`.txt`, `.pdf`) or paste text
- AI-generated summary, bullet points, and action items
- Searchable history per user
- Rate limiting on the summarize endpoint (10 req/min per IP)

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm
- A [Supabase](https://supabase.com) project (used for both auth and database in all environments)
- An [OpenAI](https://platform.openai.com) API key
- An [Upstash](https://upstash.com) Redis database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

> Local development points at the same Supabase project as production. No local database is required.

| Variable | Where to find it |
|----------|-----------------|
| `DATABASE_URL` | Supabase → Project Settings → Database → Transaction pooler URI (port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon key |
| `OPENAI_API_KEY` | platform.openai.com → API keys |
| `UPSTASH_REDIS_REST_URL` | Upstash console → Redis database → REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console → Redis database → REST token |

### 3. Set up the database

Push the schema to your Supabase database:

```bash
pnpm db:push
```

Then enable Row Level Security in the **Supabase SQL Editor**:

```sql
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage their own summaries"
  ON summaries FOR ALL
  USING (user_id = auth.uid());
```

### 4. Configure Supabase Auth

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`

For GitHub OAuth: **Authentication → Providers → GitHub** — add your GitHub OAuth app credentials.

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```
