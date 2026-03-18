import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser/client components only
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quote = {
    id: string;
    name: string;
    email: string;
    project_type: string;
    description: string;
    summary: string;
    services_matched: string[];
    estimated_timeline: string;
    estimated_cost: string;
    why_hire_me: string;
    next_steps: string[];
    status: "new" | "contacted" | "won" | "lost";
    notes: string | null;
    created_at: string;
};