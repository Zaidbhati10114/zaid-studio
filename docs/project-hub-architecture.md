# Project Hub Architecture

This document covers only the `/admin/project-hub` feature and the files directly related to loading, generating, editing, validating, and saving proposal drafts.

## Feature purpose

`/admin/project-hub/[quoteId]` is the internal proposal-building workspace for a quote. It lets an admin:

- load quote data and any saved proposal draft
- add meeting notes
- generate a polished proposal draft with AI
- edit proposal sections manually
- save the draft back to the database

## High-level flow

```text
/admin/project-hub/[quoteId]
  -> hooks/useProposal.ts
    -> GET /api/admin/proposals/[quoteId]
      -> lib/repositories/project-hub.ts
        -> quotes + proposal_drafts tables

Generate AI
  -> hooks/useProposal.ts
    -> POST /api/admin/proposals/generate
      -> lib/repositories/quotes
      -> lib/mappers/quote-to-proposal.ts
      -> lib/ai/proposal-generator.ts
      -> lib/ai/proposal-prompt.ts
      -> lib/ai-providers.ts

Save Draft
  -> hooks/useProposal.ts
    -> POST /api/admin/proposals/save
      -> lib/repositories/proposal-drafts.ts
      -> lib/mappers/proposal-draft.ts
      -> proposal_drafts table
```

## Main route

### [app/(admin)/admin/(dashboard)/project-hub/[quoteId]/page.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/[quoteId]/page.tsx)

Client page for the Project Hub proposal builder.

Responsibilities:

- creates the `react-hook-form` form with `proposalFormSchema`
- loads project hub data with `useProjectHub`
- resets the form when a saved draft exists
- stores local `adminNotes` used for AI generation
- triggers proposal generation and saving
- renders the main layout with `ProposalToolbar`, `ClientSidebar`, and `ProposalEditor`

## UI structure

### Layout components

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/ProposalToolbar.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/ProposalToolbar.tsx)

Top action bar for generate, save, and send actions. It also reflects busy states like `Generating...` and `Saving...`.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/ClientSidebar.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/ClientSidebar.tsx)

Left sidebar showing quote context, client details, project details, editable meeting notes, and basic metadata.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/ProposalEditor.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/ProposalEditor.tsx)

Main editor area. Organizes proposal editing into sections:

- Overview
- Project Scope
- Execution
- Delivery
- Commercial Terms

## Cards used inside the editor

### [app/(admin)/admin/(dashboard)/project-hub/cards/SummaryCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/cards/SummaryCard.tsx)

Edits the proposal summary field.

### [app/(admin)/admin/(dashboard)/project-hub/cards/TimelineCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/cards/TimelineCard.tsx)

Edits the overall estimated timeline.

### [app/(admin)/admin/(dashboard)/project-hub/cards/CostCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/cards/CostCard.tsx)

Edits the estimated cost/investment field.

### [app/(admin)/admin/(dashboard)/project-hub/cards/DeliverablesCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/cards/DeliverablesCard.tsx)

Edits deliverables as one item per line and converts textarea input into a string array.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/TechStackCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/TechStackCard.tsx)

Manages the editable list of recommended technologies.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/PhaseCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/PhaseCard.tsx)

Manages proposal phases with `useFieldArray`, allowing add/remove of implementation phases.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/ClientResponsiblitiesCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/ClientResponsiblitiesCard.tsx)

Manages the list of client responsibilities required during project delivery.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/RisksCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/RisksCard.tsx)

Manages project risks with add/remove support for structured risk entries.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/NextStepsCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/NextStepsCard.tsx)

Manages the list of next steps shown after proposal approval.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/CommericialTermsCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/cards/CommericialTermsCard.tsx)

Edits support policy, payment terms, and ownership terms.

## Shared editor building blocks

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/ProposalCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/ProposalCard.tsx)

Reusable card wrapper for top-level proposal sections.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/SectionCard.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/SectionCard.tsx)

Smaller nested card used inside cards like phases and risks.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/SectionHeading.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/SectionHeading.tsx)

Simple heading component for each editor section.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/EditableList.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/EditableList.tsx)

Generic add/remove list UI used by tech stack, next steps, responsibilities, and phase tasks.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/EmptyState.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/EmptyState.tsx)

Reusable empty-state UI when a list has no items yet.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/PhaseEditor.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/PhaseEditor.tsx)

Editor for a single proposal phase, including phase name, duration, and task list.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/TaskList.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/TaskList.tsx)

Handles editable tasks inside a phase.

### [app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/RiskEditor.tsx](/Users/zaidbhati/Developer/Projects/client-firm/app/(admin)/admin/(dashboard)/project-hub/components/layout/shared/RiskEditor.tsx)

Editor for a single structured risk with `risk` and `mitigation`.

## Client-side data layer

### [hooks/useProposal.ts](/Users/zaidbhati/Developer/Projects/client-firm/hooks/useProposal.ts)

Main client data layer for this feature.

Responsibilities:

- fetches project hub data with `useProjectHub`
- generates AI proposals with `useGenerateProposal`
- saves drafts with `useSaveProposal`
- normalizes API failures through `ProposalApiError`
- reports server-side failures to Sentry
- defines React Query cache keys for the feature

## API routes used by Project Hub

### [app/api/admin/proposals/[quoteId]/route.ts](/Users/zaidbhati/Developer/Projects/client-firm/app/api/admin/proposals/[quoteId]/route.ts)

GET endpoint that loads the quote and any saved proposal draft for the project hub page.

### [app/api/admin/proposals/generate/route.ts](/Users/zaidbhati/Developer/Projects/client-firm/app/api/admin/proposals/generate/route.ts)

POST endpoint that:

- validates `quoteId`
- loads the original quote
- maps quote data into AI input
- calls the AI generator
- returns a generated proposal draft

### [app/api/admin/proposals/save/route.ts](/Users/zaidbhati/Developer/Projects/client-firm/app/api/admin/proposals/save/route.ts)

POST endpoint that validates the payload and saves the current proposal draft.

## Repository and persistence layer

### [lib/repositories/project-hub.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/repositories/project-hub.ts)

Loads the two core data sources for the page:

- the `quotes` row
- the matching `proposal_drafts` row, if one exists

It returns them as `ProjectHubData`.

### [lib/repositories/proposal-drafts.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/repositories/proposal-drafts.ts)

Handles upserting proposal drafts into Supabase. It:

- checks whether a draft already exists for the quote
- updates or inserts the `proposal_drafts` row
- sets generated/update timestamps
- updates `quotes.last_generated_at`

## Mapping layer

### [lib/mappers/quote-to-proposal.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/mappers/quote-to-proposal.ts)

Transforms quote database data into the AI-ready `ProposalGenerationInput` shape. It also safely normalizes array-like values such as phases and risks.

### [lib/mappers/proposal-draft.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/mappers/proposal-draft.ts)

Converts proposal draft data between:

- database column names like `estimated_timeline`
- frontend/domain names like `estimatedTimeline`

This mapper is used both when loading drafts and when saving them.

## AI generation layer

### [lib/ai/proposal-generator.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/ai/proposal-generator.ts)

Orchestrates proposal generation. It builds the prompt, calls the fallback AI provider layer, and injects agency default legal/commercial terms into the final proposal object.

### [lib/ai/proposal-prompt.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/ai/proposal-prompt.ts)

Builds the prompt sent to the AI model. The prompt tells the model to polish the original estimate into a client-ready proposal while preserving agreed scope unless meeting notes justify changes.

### [lib/ai-providers.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/ai-providers.ts)

Shared provider fallback layer used by proposal generation. It:

- tries multiple providers in round-robin order
- only falls through on rate-limit style failures
- extracts and parses JSON from model responses

## Validation, types, and defaults

### [lib/validation/proposal-schema.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/validation/proposal-schema.ts)

Zod schema for the editable proposal form. This is the main validation contract for the project hub UI.

### [lib/ai/proposal-schema.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/ai/proposal-schema.ts)

Defines the proposal data shape used across AI generation, API responses, and draft persistence.

### [lib/types.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/types.ts)

Defines shared request and payload types used by the generate/save proposal APIs.

### [lib/proposals/defaults.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/proposals/defaults.ts)

Provides factory helpers for empty phase and risk objects used when users add new items in the editor.

### [lib/models/quote.ts](/Users/zaidbhati/Developer/Projects/client-firm/lib/models/quote.ts)

Defines the quote shape used by the project hub UI and client-side data fetching.

## Architecture summary

Project Hub is structured as a form-driven admin workspace:

- the page owns form state and user actions
- reusable cards split the proposal into editable sections
- hooks and API routes isolate client/server communication
- repositories and mappers isolate database details
- AI helpers convert quote data into a polished proposal draft

This separation keeps the UI focused on editing, while generation, persistence, and data transformation stay in dedicated layers.
