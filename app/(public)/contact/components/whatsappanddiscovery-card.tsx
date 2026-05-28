import { ArrowRight } from "lucide-react";

export default function WhatsAppAndDiscoveryCard() {
  return (
    <>
      <a
        href="#"
        className="group rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-green-500/30 hover:bg-card/50 transition-all"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-green-500">
              Quickest Option
            </p>

            <h3 className="mt-3 text-xl font-semibold">WhatsApp Chat</h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
              Perfect for quick questions, discussing ideas, sharing references,
              and getting advice before starting a project.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-green-500 font-medium">
          Message Now
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
      <a
        href="#"
        className="group rounded-2xl border border-border/50 bg-card/30 p-6 hover:border-blue-500/30 hover:bg-card/50 transition-all"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-500">
            Free Consultation
          </p>

          <h3 className="mt-3 text-xl font-semibold">Discovery Call</h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
            Schedule a free 30-minute call to discuss requirements, timelines,
            budgets, and the best approach for your project.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 text-blue-500 font-medium">
          Book a Call
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </a>
    </>
  );
}
