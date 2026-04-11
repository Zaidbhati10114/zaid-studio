"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Services & Scope of Work",
    content: `Zaid Studio provides custom web development services including but not limited to landing pages, full-stack web applications, SaaS products, API development, and AI-powered tools.

All project scopes are defined in writing before work begins. Any features or requirements not explicitly agreed upon are considered out of scope and will be quoted separately.

Zaid Studio reserves the right to decline any project at its discretion.`,
  },
  {
    title: "2. Payment Terms",
    content: `All projects follow a milestone-based payment structure:

• 50% upfront deposit before work begins (non-refundable)
• 50% upon project completion before final delivery

For larger projects (₹1,00,000+), a three-milestone structure may apply:
• 30% upfront to start
• 40% at mid-project milestone
• 30% before final delivery

No work will begin without receipt of the upfront deposit. Delays in payment from the client may result in equivalent delays in project delivery.

Payments are accepted via Razorpay, Stripe, or direct bank transfer.`,
  },
  {
    title: "3. Refund Policy",
    content: `The upfront deposit is non-refundable once work has commenced.

If Zaid Studio is unable to complete the project due to unforeseen circumstances on our end, a pro-rated refund will be issued based on work completed.

No refunds will be issued for completed and delivered work that has been approved by the client.

Change of mind after project commencement does not qualify for a refund.`,
  },
  {
    title: "4. Revisions & Changes",
    content: `Each package includes a defined number of revision rounds:

• Starter (Landing Page): 2 revision rounds
• Business (Web App): 3 revision rounds
• Growth (SaaS Product): Unlimited revisions within scope

Revisions apply to existing agreed features only. New features, major design changes, or additions to scope will be treated as a separate project and quoted accordingly.

A "revision round" is defined as a consolidated list of changes submitted at one time, not individual requests made over multiple sessions.`,
  },
  {
    title: "5. Timeline & Delivery",
    content: `Estimated timelines provided in proposals are based on prompt client cooperation and timely feedback.

Timelines begin from the date the upfront payment is received and all required project materials are provided by the client.

Delays caused by late client feedback, missing content, or unresponsiveness will extend the delivery timeline accordingly and are not the responsibility of Zaid Studio.

Zaid Studio will communicate any delays proactively and as early as possible.`,
  },
  {
    title: "6. Client Responsibilities",
    content: `The client is responsible for providing:

• All required content (text, images, logos, branding assets)
• Clear and timely feedback within agreed timeframes
• Access to required accounts or platforms when necessary
• A single designated point of contact for approvals

Failure to provide the above in a timely manner may result in project delays or additional charges.`,
  },
  {
    title: "7. Intellectual Property & Ownership",
    content: `Upon receipt of full and final payment, the client owns all custom code, designs, and assets created specifically for their project.

Zaid Studio retains the right to display the completed project in its portfolio and case studies unless otherwise agreed in writing.

Any third-party tools, libraries, or frameworks used remain subject to their respective licenses.

Zaid Studio retains ownership of all work until full payment is received.`,
  },
  {
    title: "8. Post-Launch Support",
    content: `All projects include 30 days of post-launch support for bug fixes and minor adjustments related to the delivered scope.

Post-launch support does not include new features, redesigns, or third-party service issues.

After the 30-day period, ongoing maintenance and support are available as a separate paid retainer starting at ₹10,000/month.`,
  },
  {
    title: "9. Confidentiality",
    content: `Zaid Studio will treat all client business information, project details, and communications as confidential and will not share them with third parties without explicit written consent.

Clients are similarly expected to keep any proprietary processes, pricing, or internal documentation shared by Zaid Studio confidential.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `Zaid Studio is not liable for any indirect, incidental, or consequential damages arising from the use of delivered work, including but not limited to loss of revenue, data loss, or business interruption.

Our total liability in any dispute is limited to the amount paid for the specific project in question.

Zaid Studio is not responsible for issues caused by third-party services, hosting providers, or client modifications to delivered code.`,
  },
  {
    title: "11. Termination",
    content: `Either party may terminate a project with 7 days written notice.

In the event of termination by the client, payment is due for all work completed up to the termination date. The upfront deposit is non-refundable.

In the event of termination by Zaid Studio due to client misconduct, non-payment, or abusive behavior, all work product remains the property of Zaid Studio until outstanding payments are settled.`,
  },
  {
    title: "12. Governing Law",
    content: `These terms are governed by the laws of India. Any disputes arising from these terms or our services shall be subject to the jurisdiction of courts in Sangli, Maharashtra, India.

By engaging Zaid Studio for services, you agree to these terms and conditions in full.`,
  },
];

export default function TermsPage() {
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
              Terms &{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Conditions
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              These terms govern all projects and services provided by Zaid
              Studio. By engaging our services, you agree to these terms.
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
            <h2 className="text-lg font-semibold mb-2">Questions?</h2>
            <p className="text-sm text-foreground/75 mb-4">
              If you have any questions about these terms, please reach out
              before engaging our services.
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
