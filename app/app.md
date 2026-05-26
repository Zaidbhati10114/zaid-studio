# App Overview

This app is the marketing website and lead intake system for **Zaid Studio**. It showcases services, portfolio work, and company pages, then lets visitors generate an AI-powered project proposal and quote. Submitted quotes are stored in Supabase and can be reviewed from a lightweight admin dashboard.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Radix UI
- **Styling / UX:** Framer Motion, Lucide icons, Geist font, `next-themes`
- **Backend / Data:** Next.js Route Handlers, Supabase
- **AI:** Google Gemini via `@google/generative-ai`
- **Language:** TypeScript

## Main Routes

- `/` - public landing page
- `/about` - studio/about page
- `/work` - portfolio/work page
- `/get-quote` - multi-step quote form
- `/get-quote/sample` - sample quote flow/page
- `/quotes/[id]` - generated quote result page
- `/privacy` - privacy policy
- `/terms` - terms page
- `/admin/login` - admin login
- `/admin` - admin dashboard for quote management
- `/admin/quotes/[id]` - admin quote detail page

## API Routes

- `/api/generate-quote` - generates an AI proposal and saves it to Supabase
- `/api/admin/login` - admin auth entry point
- `/api/admin/logout` - admin logout

## Architecture

- `app/(public)` contains the public website and quote experience.
- `app/(admin)` contains the admin login and dashboard views.
- `app/components` holds shared UI used across routes like navbar, footer, FAQ, booking bar, and quote display.
- `lib/` contains shared integrations and helpers such as Supabase clients, utility functions, and the AI resume/context prompt.
- `app/layout.tsx` defines global metadata, theme support, and app-wide styling.

## Flow Summary

1. A visitor lands on the public site and starts the quote form.
2. The form posts project details to `/api/generate-quote`.
3. Gemini generates a structured proposal.
4. The proposal is stored in Supabase and assigned an ID.
5. The user is redirected to `/quotes/[id]`, while admins can review submissions in `/admin`.
