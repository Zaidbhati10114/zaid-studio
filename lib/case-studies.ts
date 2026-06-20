// lib/case-studies.ts

export interface CaseStudyFeature {
    title: string;
    description: string;
    icon: string;
}

export interface CaseStudyTech {
    name: string;
    reason: string;
}

export interface CaseStudyStat {
    value: string;
    label: string;
}

export interface CaseStudy {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    industry: string;
    location: string;
    status: "live" | "in-progress" | "completed";
    statusLabel: string;
    url: string;
    builtIn: string;
    role: string;
    accentColor: string; // tailwind color name e.g. "emerald"
    problem: {
        headline: string;
        body: string[];
    };
    solution: {
        headline: string;
        body: string;
    };
    features: CaseStudyFeature[];
    tech: CaseStudyTech[];
    stats: CaseStudyStat[];
    outcome: string[];
    tags: string[];
}

export const caseStudies: CaseStudy[] = [
    {
        slug: "ashabi-clinic",
        name: "Ashabi Clinic",
        tagline: "From walk-in queues to a fully digital clinic",
        description:
            "Built and maintain the complete digital presence for a busy medical clinic in Sangli — online booking, self-serve cancellations, WhatsApp confirmations, admin dashboard, and Google Maps presence.",
        industry: "Healthcare",
        location: "Sangli, Maharashtra",
        status: "live",
        statusLabel: "Live · actively maintained",
        url: "https://ashabi-clinic.vercel.app",
        builtIn: "2024",
        role: "Solo developer — design, build, deploy, maintain",
        accentColor: "emerald",
        problem: {
            headline: "30 patients a day, all walk-ins, no system",
            body: [
                "Ashabi Clinic sees around 30 patients every day. Before this project, every single one of them had to show up physically and wait — first come, first served. There was no way to book in advance, no way to know how long the wait would be, and no way to cancel without calling.",
                "The doctor had no visibility into the day ahead. Each morning started blind — no idea how many patients were coming, for what reason, or at what time. Managing the schedule meant handling everything manually as patients walked through the door.",
                "There was also zero digital presence. No website, no Google Maps listing, no way for new patients to find the clinic online or learn anything about it before visiting.",
            ],
        },
        solution: {
            headline: "A complete digital system, built from scratch",
            body: "The goal was simple: let patients book online and give the doctor a clear view of every day. Everything else — cancellations, email confirmations, WhatsApp flow, admin dashboard — followed from that. Built solo in Next.js with Supabase, deployed on Vercel, and actively maintained since launch.",
        },
        features: [
            {
                title: "Online appointment booking",
                description:
                    "Patients fill a short form — name, age, phone, preferred date, morning or evening slot, and reason for visit. The booking saves to Supabase instantly and triggers an email confirmation with a unique cancellation link.",
                icon: "📅",
            },
            {
                title: "Self-serve cancellation",
                description:
                    "Every confirmation email contains a unique token-based cancel link. Patients cancel themselves without calling the clinic. The appointment status updates in real time — no manual intervention needed.",
                icon: "✕",
            },
            {
                title: "Admin dashboard",
                description:
                    "The doctor logs in with Supabase Auth and sees every appointment — filterable by date and status. Pending, confirmed, cancelled — all in one view. The day starts with full visibility instead of guesswork.",
                icon: "🗂️",
            },
            {
                title: "Email notifications",
                description:
                    "EmailJS sends booking confirmations and cancellation receipts automatically. No backend email server needed. Patients get a professional confirmation the moment they book.",
                icon: "✉️",
            },
            {
                title: "Google Maps presence",
                description:
                    "Set up and manage the clinic's Google Business Profile — address, hours, photos, category. New patients can now find the clinic in local search and get directions directly.",
                icon: "📍",
            },
        ],
        tech: [
            {
                name: "Next.js",
                reason: "App Router for fast page loads and good SEO for local search",
            },
            {
                name: "TypeScript",
                reason: "Type safety across the booking flow and admin dashboard",
            },
            {
                name: "Supabase",
                reason:
                    "Appointments table, RLS for security, Auth for admin login",
            },
            {
                name: "EmailJS",
                reason: "Email confirmations without a dedicated email server",
            },
            {
                name: "Framer Motion",
                reason: "Smooth multi-step booking form transitions",
            },
            {
                name: "Tailwind CSS",
                reason: "Fast, consistent styling across all pages",
            },
            {
                name: "Vercel",
                reason: "Zero-config deployment, always live, automatic previews",
            },
        ],
        stats: [
            { value: "30+", label: "Patients per day" },
            { value: "100%", label: "Digital bookings" },
            { value: "0", label: "Phone calls to cancel" },
            { value: "Solo", label: "Built & maintained" },
        ],
        outcome: [
            "Patients book at any time — no walk-in queues for routine appointments",
            "Doctor starts every day knowing exactly who is coming and when",
            "Cancellations handled entirely by patients — zero manual work",
            "Clinic is now discoverable on Google Maps for local patients",
            "Actively maintained — updates and improvements shipped regularly",
        ],
        tags: [
            "Next.js",
            "Supabase",
            "TypeScript",
            "Tailwind CSS",
            "EmailJS",
            "Vercel",
        ],
    },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
    return caseStudies.find((s) => s.slug === slug);
}

export function getAllCaseStudies(): CaseStudy[] {
    return caseStudies;
}