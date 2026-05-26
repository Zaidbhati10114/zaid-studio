"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use Zaid Studio's website or services, we may collect the following information:

Personal Information:
• Name and email address (when you submit a quote request or contact us)
• Project details and descriptions you provide through our forms

Technical Information:
• Basic usage data collected automatically (page views, browser type)
• IP address for security purposes

We only collect information that is necessary to provide our services and respond to your enquiries.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information solely for the following purposes:

• To generate your AI-powered project proposal
• To communicate with you about your project enquiry
• To follow up on proposals you have requested
• To improve our services and website experience

We do not use your information for automated profiling, targeted advertising, or any purpose beyond what is stated above.`,
  },
  {
    title: "3. Data Storage & Security",
    content: `Your data is stored securely using Supabase, a trusted cloud database platform with enterprise-grade security.

We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse.

Project proposals generated through our system are stored and accessible via a unique URL. Only individuals with this URL can access your specific proposal.

We retain your data for as long as necessary to provide our services and comply with legal obligations.`,
  },
  {
    title: "4. Data Sharing",
    content: `We do not sell, rent, or share your personal information with third parties for marketing purposes.

Your data may be shared with:

• Supabase (database hosting) — for secure data storage
• Google (Gemini AI) — project descriptions are processed to generate proposals
• EmailJS — to send proposal emails at your request
• Vercel — website hosting provider

All third-party services we use are bound by their own privacy policies and data protection standards.`,
  },
  {
    title: "5. Cookies",
    content: `Our website uses minimal cookies necessary for basic functionality including:

• Theme preference (dark/light mode)
• Admin session authentication (for internal use only)

We do not use tracking cookies, advertising cookies, or third-party analytics cookies.

You can disable cookies in your browser settings, though this may affect certain website functionality.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to:

• Request access to the personal data we hold about you
• Request correction of inaccurate information
• Request deletion of your data
• Withdraw consent for us to process your data

To exercise any of these rights, please contact us at zaidbhati7007@gmail.com. We will respond to all requests within 30 days.`,
  },
  {
    title: "7. Children's Privacy",
    content: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors.

If you believe we have inadvertently collected information from a minor, please contact us immediately and we will delete it promptly.`,
  },
  {
    title: "8. AI-Generated Proposals",
    content: `When you submit a project enquiry, your name, email, project type, and description are sent to Google's Gemini AI to generate a personalized proposal.

This data is processed to produce your proposal and is not used by Google to train their AI models under standard API usage terms.

Generated proposals are stored in our database and accessible via your unique proposal link. We recommend saving this link if you wish to access your proposal later.`,
  },
  {
    title: "9. Links to Third-Party Sites",
    content: `Our website may contain links to third-party websites including project demos and external tools. 

We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this privacy policy from time to time to reflect changes in our practices or legal requirements.

When we make significant changes, we will update the "Last updated" date at the top of this page.

Continued use of our website after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this privacy policy or how we handle your data, please contact us:

Mohammad Zaid Bhati
Zaid Studio
Mumbai, Maharashtra, India
Email: zaidbhati7007@gmail.com

We are committed to resolving any privacy concerns promptly and transparently.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-6 pb-10 pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[80px]" />
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-blue-500">
              Legal
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Privacy{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              This policy explains how Zaid Studio collects, uses, and protects
              your personal information when you use our website and services.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: March 2026
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-30" />

      <section className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="flex flex-col gap-3"
            >
              <h2 className="text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="rounded-2xl border border-border/50 bg-card/20 p-5">
                <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-blue-500/15 bg-blue-500/4 p-6"
          >
            <h2 className="text-lg font-semibold mb-2">Privacy Concerns?</h2>
            <p className="text-sm text-foreground/75 mb-4">
              If you have any questions about how we handle your data or wish to
              exercise your rights, contact us directly.
            </p>
            <a
              href="mailto:zaidbhati7007@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              zaidbhati7007@gmail.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
