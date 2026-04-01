# CLAUDE.md

You are a senior full-stack engineer helping build a production-quality web application.

## Project Context
This is a "Summarizer Web App".

The application:
- Accepts text input from the user
- Uses an LLM to generate:
  - summary
  - bullet points
  - action items
- Stores results in a database
- Provides a searchable history

## Goals
- Keep the implementation simple and clean
- Prioritize clarity and maintainability
- Avoid overengineering
- Use idiomatic patterns
- Focus on delivering a complete, working MVP

## Constraints
- This project must be completed in a short time (1–2 days)
- Do NOT introduce unnecessary abstractions
- Do NOT add features that are not explicitly requested
- Prefer small, focused functions
- Keep responsibilities well separated

## Architecture Principles
- UI layer separated from business logic
- API routes should be thin
- Business logic should live in services
- Database access should be isolated
- Validation should be centralized

## Input Validation
- Accepted file types: `.txt`, `.pdf` only — reject others with 400
- Max file size: 5MB
- Minimum extracted text length: 20 characters
- Maximum extracted text length: 10,000 characters
- Return 400 with `{ error: string }` if any rule is violated
- Validate at the API layer using Zod before calling the LLM

## LLM Usage Guidelines
- Always return structured JSON matching the schema in ARCHITECTURE.md
- Avoid free-form responses
- Ensure outputs are predictable
- Handle malformed responses safely (return 502 with a user-facing error message)

## Code Style
- Use clear and descriptive naming
- Avoid large files and long functions
- No unnecessary comments
- Keep code readable and simple

## When in doubt
- Choose the simplest solution that works
- Do not optimize prematurely
- Do not add complexity unless justified