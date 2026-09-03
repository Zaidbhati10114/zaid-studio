import { Clock3, Wallet, Layers3, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  proposal: any;
}

export default function SummaryCards({ proposal }: Props) {
  const deliverables =
    proposal?.deliverables?.length ?? proposal?.phases?.length ?? 0;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Project Summary</h2>
        <p className="text-muted-foreground">
          A quick overview of what you&apos;ll receive after approval.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          icon={<Clock3 className="h-6 w-6 text-blue-600" />}
          label="Timeline"
          value={proposal?.estimated_timeline || "TBD"}
        />

        <SummaryCard
          icon={<Wallet className="h-6 w-6 text-green-600" />}
          label="Investment"
          value={proposal?.estimated_cost || "TBD"}
        />

        <SummaryCard
          icon={<Layers3 className="h-6 w-6 text-purple-600" />}
          label="Complexity"
          value={proposal?.complexity || "Standard"}
        />

        <SummaryCard
          icon={<CheckCircle2 className="h-6 w-6 text-orange-600" />}
          label="Deliverables"
          value={`${deliverables} Included`}
        />
      </div>
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="group border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="space-y-3 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-muted">
          {icon}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

          <h3 className="mt-1 text-lg font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
