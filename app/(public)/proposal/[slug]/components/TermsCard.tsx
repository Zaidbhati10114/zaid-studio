import {
  ShieldCheck,
  Wallet,
  KeyRound,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  proposal: any;
  termsVersion: string;
}

export default function TermsCard({ proposal, termsVersion }: Props) {
  return (
    <section className="space-y-6">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold">Project Agreement</h2>

        <p className="text-muted-foreground">
          The key terms that become effective once you approve this proposal.
        </p>
      </div>

      {/* Three agreement cards */}

      <div className="grid gap-4 md:grid-cols-3">
        <AgreementCard
          icon={<ShieldCheck className="h-6 w-6 text-green-600" />}
          title="Support"
          text={
            proposal?.agency_support_policy ||
            "30 days of complimentary bug-fix support after final delivery."
          }
        />

        <AgreementCard
          icon={<Wallet className="h-6 w-6 text-blue-600" />}
          title="Payment"
          text={
            proposal?.agency_payment_terms ||
            "50% before development begins and 50% before deployment."
          }
        />

        <AgreementCard
          icon={<KeyRound className="h-6 w-6 text-purple-600" />}
          title="Ownership"
          text={
            proposal?.agency_ownership_terms ||
            "Ownership transfers after full payment."
          }
        />
      </div>

      {/* What Happens Next */}

      <Card className="border shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-semibold">What Happens Next</h3>

            <p className="text-sm text-muted-foreground">
              Here&apos;s exactly what happens after you approve this proposal.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <TimelineStep
              number="01"
              title="Approval"
              text="You accept the proposal."
            />

            <TimelineStep
              number="02"
              title="Invoice"
              text="50% advance invoice is sent."
            />

            <TimelineStep
              number="03"
              title="Development"
              text="Project begins immediately."
            />

            <TimelineStep
              number="04"
              title="Delivery"
              text="Final deployment and handover."
            />
          </div>
        </CardContent>
      </Card>

      {/* Trust footer */}

      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-600" />

            <div>
              <p className="font-semibold">Secure Digital Acceptance</p>

              <p className="text-sm text-muted-foreground">
                Your acceptance is securely recorded with a timestamp and the
                current terms version.
              </p>
            </div>
          </div>

          <Badge variant="secondary">Terms {termsVersion}</Badge>
        </CardContent>
      </Card>
    </section>
  );
}

function AgreementCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="group border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-muted">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
          {number}
        </span>

        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <h4 className="mt-4 font-semibold">{title}</h4>

      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
