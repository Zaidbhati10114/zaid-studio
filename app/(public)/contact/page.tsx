"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppAndDiscoveryCard from "./components/whatsappanddiscovery-card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error();
      }

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        company: "",
        message: "",
        website: "",
      });
    } catch {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-24">
      {/* Hero */}
      <div className="text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-blue-500">
          Contact
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Let&apos;s Talk About Your Project
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Have an idea, need advice, or want to discuss a project? Choose
          whichever communication method works best for you.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <WhatsAppAndDiscoveryCard />
      </div>

      {/* Form */}

      {/* Form */}
      <div className="mt-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                website: e.target.value,
              }))
            }
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Header */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-blue-500">
              Contact Form
            </p>

            <h2 className="text-2xl font-semibold tracking-tight">
              Send a Message
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Prefer email? Tell me a little about your project, question, or
              idea and I&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Input
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="
          h-11
          rounded-xl
          border-border/50
          bg-background/50
          text-base
          focus-visible:ring-1
          focus-visible:ring-blue-500
          focus-visible:ring-offset-0
        "
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Email
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              className="
          h-11
          rounded-xl
          border-border/50
          bg-background/50
          text-base
          focus-visible:ring-1
          focus-visible:ring-blue-500
          focus-visible:ring-offset-0
        "
              required
            />
          </div>

          {/* Company */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Company
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </label>

            <Input
              placeholder="Company name"
              value={form.company}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  company: e.target.value,
                }))
              }
              className="
          h-11
          rounded-xl
          border-border/50
          bg-background/50
          text-base
          focus-visible:ring-1
          focus-visible:ring-blue-500
          focus-visible:ring-offset-0
        "
            />
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              What would you like to discuss?
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Textarea
              rows={6}
              placeholder="Tell me about your project, idea, challenge, or question..."
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              className="
          resize-none
          rounded-xl
          border-border/50
          bg-background/50
          text-base
          focus-visible:ring-1
          focus-visible:ring-blue-500
          focus-visible:ring-offset-0
        "
              required
            />
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Whether you&apos;re planning a website, SaaS product, internal
              tool, AI application, or simply exploring an idea, I&apos;m happy
              to help point you in the right direction.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full gap-2 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                Send Message
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Usually replies within 24 hours.
          </p>
          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500">
              Thanks for reaching out. I&apos;ve received your message and will
              get back to you shortly.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
