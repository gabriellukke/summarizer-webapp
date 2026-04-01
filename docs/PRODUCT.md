# PRODUCT.md

## Overview

A simple web application that summarizes reports using an LLM.

## Core Features

- User can upload a report file (`.txt` or `.pdf`) or paste text directly
- App generates:
  - summary
  - bullet points
  - action items
- Results are saved with the original filename (if uploaded) or a truncated preview
- User can view history
- User can search previous summaries

## UX Expectations

- Clean and minimal interface
- File upload input + paste textarea (user can use either)
- Clear loading states
- Clear error messages (including unsupported file type)
- Easy-to-read output structure

## Output Structure

- Summary: short paragraph
- Bullet Points: concise list
- Action Items: actionable tasks

## Success Criteria

- End-to-end flow works reliably
- Output is structured and predictable
- History is usable and searchable
- App is easy to understand and run