-- Supabase SQL Migration: Client Onboarding Forms & Submissions
-- Run this in your Supabase SQL Editor if you want to store onboarding forms directly in Supabase.

CREATE TABLE IF NOT EXISTS onboarding_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    proposal_id TEXT,
    client_name TEXT NOT NULL,
    client_email TEXT,
    project_title TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_forms_slug ON onboarding_forms(slug);
CREATE INDEX IF NOT EXISTS idx_onboarding_forms_quote_id ON onboarding_forms(quote_id);

CREATE TABLE IF NOT EXISTS onboarding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES onboarding_forms(id) ON DELETE CASCADE,
    form_slug TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewed'
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_form_id ON onboarding_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_form_slug ON onboarding_submissions(form_slug);

-- Enable RLS
ALTER TABLE onboarding_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read of published onboarding forms by slug
CREATE POLICY "Public read published onboarding forms" ON onboarding_forms
    FOR SELECT USING (status = 'published');

-- Allow public insert of submissions
CREATE POLICY "Public insert submissions" ON onboarding_submissions
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access on forms" ON onboarding_forms
    FOR ALL USING (true);

CREATE POLICY "Service role full access on submissions" ON onboarding_submissions
    FOR ALL USING (true);
