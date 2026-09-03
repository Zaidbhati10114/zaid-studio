import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Hero({ proposal }: { proposal: any }) {
  return (
    <Card className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Proposal for</p>

          <h1 className="text-3xl font-bold">{proposal.business_name}</h1>

          <p className="mt-2 text-muted-foreground">
            Prepared for {proposal.client_name}
          </p>
        </div>

        <Badge variant="secondary">Ready for Approval</Badge>
      </div>

      <p className="mt-6 text-muted-foreground">
        Review the proposal below. Once you accept the terms, we&apos;ll reserve
        your project slot and begin after the advance payment.
      </p>
    </Card>
  );
}
