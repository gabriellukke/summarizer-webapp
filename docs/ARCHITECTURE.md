# ARCHITECTURE.md

## Stack
- Next.js (App Router)
- TypeScript
- PostgreSQL
- Drizzle ORM
- OpenAI API
- Zod for validation
- `pdf-parse` for PDF text extraction
- Docker + Docker Compose (local dev and reviewer setup)

## High-Level Flow

1. User uploads a `.txt`/`.pdf` file or pastes text directly
2. API extracts text from file (if uploaded) via `pdf-parse` or reads raw text
3. API validates extracted text (length bounds)
4. Service calls LLM with extracted text
5. Response is parsed and validated against schema
6. Data is stored in DB
7. UI displays structured result
8. History is available and searchable

## Layers

### UI
- Handles input, loading, display, and interactions

### API
- Handles HTTP requests
- Validates input
- Calls services

### Services
- File text extraction (pdf-parse / raw text)
- LLM interaction
- Prompt construction
- Response parsing

### Database
- Stores summaries
- Handles queries for history and search

## LLM Output Schema

The LLM must return valid JSON matching this shape (enforced with Zod):

```ts
{
  summary: string        // short paragraph
  bulletPoints: string[] // concise list items
  actionItems: string[]  // actionable tasks
}
```

## Database Schema

```
summaries
  id             serial   primary key
  title          text     not null  -- filename or truncated input preview
  original_input text     not null
  summary        text     not null
  bullet_points  jsonb    not null
  action_items   jsonb    not null
  created_at     timestamp not null default now()
```

## Key Decisions

- Keep a single main entity: summaries
- Avoid multiple tables unless necessary
- Store bullet points and action items as JSON
- Keep API simple and predictable
- Search performs case-insensitive substring match against `title`, `summary`, and `original_input` using `ILIKE`
- Accepted file types: `.txt`, `.pdf` (reject others with 400)
- Max file size: 5MB

## API Error Shape

All API errors return `{ error: string }` with an appropriate HTTP status code.

## Non-Goals (for this MVP)

- Authentication
- File storage complexity
- Distributed systems
- Advanced search engines