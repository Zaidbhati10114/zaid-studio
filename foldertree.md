# App Folder Tree

This document maps the `app/` directory of the Zaid Studio project and explains what each file is responsible for.

## App Summary

- Framework: Next.js App Router
- Purpose: marketing site, AI quote generation flow, lightweight admin dashboard, and private client design showrooms
- Shared integrations used from outside `app/`: Supabase, Google Gemini, PostHog, Sentry, React Query, Nodemailer

## High-Level Architecture

- `app/layout.tsx` wraps the whole app with theme support, analytics, PostHog, and React Query.
- `app/(public)` contains the public-facing website and quote experience.
- `app/(admin)` contains password-protected admin routes.
- `app/api` contains route handlers for quote generation, contact/email flows, auth, and showroom management.
- `app/components` contains shared UI used by multiple routes.
- `app/p/[slug]/designs` contains private showroom pages sent to clients.

## Tree

```text
app/
├── (admin)/
│   └── admin/
│       ├── favicon.ico
│       ├── (auth)/
│       │   ├── login/
│       │   │   └── page.tsx
│       │   └── logout/
│       │       └── page.tsx
│       └── (dashboard)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── quotes/
│           │   └── [id]/
│           │       └── page.tsx
│           └── showrooms/
│               ├── page.tsx
│               ├── new/
│               │   └── page.tsx
│               └── [id]/
│                   └── edit/
│                       └── page.tsx
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── components/
│   │       └── whatsappanddiscovery-card.tsx
│   ├── get-quote/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── sample/
│   │       └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── quotes/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   └── work/
│       ├── layout.tsx
│       ├── page.tsx
│       └── [slug]/
│           ├── page.tsx
│           └── CaseStudyClient.tsx
├── api/
│   ├── admin/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── logout/
│   │   │   └── route.ts
│   │   └── showrooms/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── contact/
│   │   └── route.ts
│   ├── generate-quote/
│   │   └── route.ts
│   ├── send-proposal/
│   │   └── route.ts
│   ├── sentry-example-api/
│   │   └── route.ts
│   └── test-qroq/
│       └── route.ts
├── components/
│   ├── BookingBar.tsx
│   ├── DevQuoteFiller.tsx
│   ├── FaqSection.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProposalPDF.tsx
│   ├── QuoteClient.tsx
│   └── QuotePageClient.tsx
├── p/
│   └── [slug]/
│       └── designs/
│           ├── page.tsx
│           └── ShowroomClient.tsx
├── providers/
│   └── QueryProvider.tsx
├── app.md
├── apple-touch-icon.png
├── favicon.ico
├── global-error.tsx
├── globals.css
├── layout.tsx
├── not-found.tsx
├── opengraph-image.tsx
├── post-hog-provider.tsx
├── robots.ts
├── sentry-example-page/
│   └── page.tsx
└── sitemap.ts
```

## File Notes

### Root app files

- `app/app.md`: short project overview already present in the repo; explains stack, routes, and quote flow.
- `app/layout.tsx`: root layout; sets metadata, global fonts, theme provider, Vercel analytics, Speed Insights, React Query, and PostHog.
- `app/globals.css`: global styles and Tailwind-driven app styling.
- `app/not-found.tsx`: branded 404 page with links back to home and quote generation.
- `app/global-error.tsx`: global App Router error boundary; reports runtime errors to Sentry.
- `app/robots.ts`: allows public pages, blocks `/admin` and `/quotes/` from crawlers.
- `app/sitemap.ts`: generates sitemap entries for core public pages.
- `app/opengraph-image.tsx`: dynamic OG image used in social previews.
- `app/post-hog-provider.tsx`: initializes PostHog on the client.
- `app/apple-touch-icon.png`, `app/favicon.ico`, `app/(admin)/admin/favicon.ico`: icon assets.
- `app/sentry-example-page/page.tsx`: Sentry test page for frontend/backend error monitoring verification.

### Public area: `app/(public)`

- `app/(public)/layout.tsx`: wraps public pages with `Navbar`, `Footer`, and the floating `BookingBar`.
- `app/(public)/page.tsx`: homepage; service cards, selected projects, process explanation, stats, and FAQ-driven conversion page.
- `app/(public)/about/layout.tsx`: metadata wrapper for the About page.
- `app/(public)/about/page.tsx`: founder/studio story, skills, timeline, values, and availability details.
- `app/(public)/contact/page.tsx`: contact form page; supports contextual enquiry via `?from=...` and posts to `/api/contact`.
- `app/(public)/contact/components/whatsappanddiscovery-card.tsx`: two CTA cards for WhatsApp and discovery-call actions.
- `app/(public)/get-quote/layout.tsx`: metadata wrapper for the quote flow.
- `app/(public)/get-quote/page.tsx`: multi-step AI quote form using `react-hook-form`, Zod validation, analytics tracking, and quote generation mutation.
- `app/(public)/get-quote/sample/page.tsx`: static sample proposal page using the shared quote presentation UI.
- `app/(public)/privacy/page.tsx`: privacy policy content page.
- `app/(public)/terms/page.tsx`: terms and conditions page.
- `app/(public)/quotes/[id]/page.tsx`: server route that fetches a stored quote from Supabase and renders the client quote view.
- `app/(public)/work/layout.tsx`: metadata wrapper for work pages.
- `app/(public)/work/page.tsx`: portfolio overview / case-study listing page.
- `app/(public)/work/[slug]/page.tsx`: server route for an individual case study.
- `app/(public)/work/[slug]/CaseStudyClient.tsx`: client-rendered case study presentation UI.

### Admin area: `app/(admin)/admin`

- `app/(admin)/admin/(auth)/login/page.tsx`: password-only admin login screen calling `/api/admin/login`.
- `app/(admin)/admin/(auth)/logout/page.tsx`: older admin layout-style component sitting inside the logout segment; not the main dashboard layout.
- `app/(admin)/admin/(dashboard)/layout.tsx`: main admin shell with responsive nav, theme toggle, and logout action.
- `app/(admin)/admin/(dashboard)/page.tsx`: admin dashboard for quote submissions; shows stats, status updates, deletion, and navigation to quote detail.
- `app/(admin)/admin/(dashboard)/quotes/[id]/page.tsx`: single quote detail view with status updates, delete flow, and client email compose action.
- `app/(admin)/admin/(dashboard)/showrooms/page.tsx`: showroom list/management screen for client design showroom links.
- `app/(admin)/admin/(dashboard)/showrooms/new/page.tsx`: form to create a new private showroom with multiple design links and thumbnails.
- `app/(admin)/admin/(dashboard)/showrooms/[id]/edit/page.tsx`: form to edit an existing showroom without changing the public share link.

### API routes: `app/api`

- `app/api/generate-quote/route.ts`: Edge route; validates form data, builds the AI prompt, calls Gemini with retry/fallback handling, stores the quote in Supabase, and returns a quote ID.
- `app/api/send-proposal/route.ts`: Node route; renders a PDF proposal with `@react-pdf/renderer` and emails it via Nodemailer.
- `app/api/contact/route.ts`: contact form handler; ignores honeypot spam, forwards enquiry email internally, and sends an acknowledgement email to the sender.
- `app/api/admin/login/route.ts`: validates admin password and sets the `admin_session` cookie.
- `app/api/admin/logout/route.ts`: clears the `admin_session` cookie.
- `app/api/admin/showrooms/route.ts`: authenticated CRUD entry for showroom listing, creation, and deletion.
- `app/api/admin/showrooms/[id]/route.ts`: authenticated single-showroom fetch and update route.
- `app/api/sentry-example-api/route.ts`: intentionally throws a backend error for Sentry testing.
- `app/api/test-qroq/route.ts`: small Groq test endpoint returning generated text.

### Shared app components: `app/components`

- `app/components/Navbar.tsx`: responsive public navigation with theme toggle and PostHog CTA tracking.
- `app/components/Footer.tsx`: footer navigation, contact link, and legal links.
- `app/components/BookingBar.tsx`: floating CTA bar that appears after scrolling.
- `app/components/FaqSection.tsx`: expandable FAQ accordion used on the homepage.
- `app/components/DevQuoteFiller.tsx`: development-only helper to autofill the quote form with test scenarios.
- `app/components/QuoteClient.tsx`: main proposal renderer; displays generated proposal sections, sharing options, email send flow, and booking/contact CTAs.
- `app/components/QuotePageClient.tsx`: adapts cached React Query quote data to DB shape and wraps quote rendering with a Sentry boundary.
- `app/components/ProposalPDF.tsx`: PDF template used when emailing proposals.

### Private showroom area: `app/p/[slug]/designs`

- `app/p/[slug]/designs/page.tsx`: server route that loads a showroom from Supabase and marks it as non-indexable.
- `app/p/[slug]/designs/ShowroomClient.tsx`: client showroom experience with desktop/mobile preview toggle, keyboard shortcuts, design selector, and booking CTA.

### Providers

- `app/providers/QueryProvider.tsx`: React Query provider with app-specific cache defaults and devtools in development.

## Request / User Flows

### Quote generation flow

1. User fills `app/(public)/get-quote/page.tsx`.
2. Form submits to `app/api/generate-quote/route.ts`.
3. AI proposal is generated and saved in Supabase.
4. User is redirected to `app/(public)/quotes/[id]/page.tsx`.
5. `app/components/QuotePageClient.tsx` and `app/components/QuoteClient.tsx` render the proposal.

### Admin quote review flow

1. Admin logs in through `app/(admin)/admin/(auth)/login/page.tsx`.
2. Cookie is set by `app/api/admin/login/route.ts`.
3. `middleware.ts` protects `/admin/*`.
4. Dashboard in `app/(admin)/admin/(dashboard)/page.tsx` lists quotes.
5. Quote details are reviewed in `app/(admin)/admin/(dashboard)/quotes/[id]/page.tsx`.

### Client showroom flow

1. Admin creates a showroom in `app/(admin)/admin/(dashboard)/showrooms/new/page.tsx`.
2. Data is stored through `app/api/admin/showrooms/route.ts`.
3. Client receives `/p/[slug]/designs`.
4. `app/p/[slug]/designs/ShowroomClient.tsx` presents design options and CTA links.

## Related Non-App Files Worth Knowing

- `middleware.ts`: protects `/admin` routes by checking `admin_session`.
- `hooks/useQuote.ts`: quote mutation/query logic used by the quote flow.
- `hooks/useLockHorizontalScroll.ts`: helper used on quote/showroom pages.
- `lib/supabase.ts` and `lib/supabase-server.ts`: browser/server Supabase clients.
- `lib/ai-providers.ts`: fallback AI provider logic used by quote generation.
- `lib/resumeContext.ts`: prompt context injected into AI quote generation.
- `lib/posthog.ts`: event names and tracking helpers used by public pages.
- `lib/quote-schema.ts`: Zod schema for the quote form.

## Notes / Observations

- The app is mostly split cleanly between public marketing pages, admin tools, and backend route handlers.
- Quote display is shared between live quotes and the sample quote page through `QuoteClient`.
- Showrooms are intentionally private and excluded from indexing.
- There appears to be an older component at `app/(admin)/admin/(auth)/logout/page.tsx` that behaves like a layout rather than a logout page, so it may be legacy or unused.
