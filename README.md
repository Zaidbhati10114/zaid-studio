# Zaid Studio

> A boutique full-stack web studio focused on modern websites, SaaS
> products, AI-powered workflows, and a seamless client experience.

## ✨ Overview

Zaid Studio is a Next.js application that combines:

-   🤖 AI-powered project proposal generation
-   💼 Transparent service pricing
-   📅 Cal.com meeting integration
-   📱 Mobile-first responsive design
-   📊 Product analytics with PostHog
-   🚨 Error monitoring with Sentry
-   ⚡ Vercel Analytics & Speed Insights

The goal is simple: help businesses move from **idea → proposal →
discussion → development** in minutes.

------------------------------------------------------------------------

## Core Features

### AI Proposal Generator

Generate a personalized project proposal in under a minute.

The proposal includes:

-   Project summary
-   Estimated timeline
-   Estimated cost
-   Deliverables
-   Project phases
-   Risks & mitigations
-   Next steps

### Multi Provider AI

Provider priority:

1.  Gemini
2.  Groq (fallback)
3.  Sarvam AI (fallback)

Only rate-limit or temporary service errors trigger provider fallback.

------------------------------------------------------------------------

## Services

-   Landing Pages
-   Full Stack Web Applications
-   SaaS Products
-   Custom Software Development

------------------------------------------------------------------------

## Contact Options

Users can:

-   Generate an AI proposal
-   Book a discovery call
-   Contact via WhatsApp
-   Submit a contact form

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   Next.js App Router
-   React
-   TypeScript
-   Tailwind CSS
-   Framer Motion
-   React Hook Form
-   Zod

### Backend

-   Next.js Route Handlers
-   Supabase
-   TanStack Query

### AI

-   Google Gemini
-   Groq
-   Sarvam AI

### Observability

-   Sentry
-   PostHog
-   Vercel Analytics
-   Vercel Speed Insights

------------------------------------------------------------------------

## Project Structure

``` text
app/
components/
hooks/
lib/
providers/
public/
```

------------------------------------------------------------------------

## Analytics

Meaningful events tracked:

-   proposal_started
-   proposal_generated
-   proposal_generation_failed
-   proposal_viewed
-   cta_clicked
-   sample_proposal_viewed

------------------------------------------------------------------------

## Client Journey

``` text
Homepage
    ↓
AI Proposal
    ↓
Proposal Review
    ↓
Book Call / WhatsApp
    ↓
Development
    ↓
Launch
```

------------------------------------------------------------------------

## Local Development

Install dependencies

``` bash
npm install
```

Run development server

``` bash
npm run dev
```

Open

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## Environment Variables

``` env
GEMINI_API_KEY=
GROQ_API_KEY=
SARVAM_API_KEY=

NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

SENTRY_AUTH_TOKEN=
```

------------------------------------------------------------------------

## Roadmap

-   Interactive Project Preview
-   Client Showroom
-   Proposal email delivery
-   Enhanced analytics dashboards
-   AI-assisted client onboarding

------------------------------------------------------------------------

## Philosophy

Build simple.

Ship fast.

Measure everything.

Under-promise and over-deliver.

------------------------------------------------------------------------

Made with ❤️ by **Zaid Studio**
