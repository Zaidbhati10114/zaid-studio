import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";

export default function SuccessState({ acceptedAt }: { acceptedAt: string }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">Proposal Accepted</h1>

          <p className="text-muted-foreground mt-2">
            Thank you. Your acceptance has been securely recorded.
          </p>
        </div>

        <div className="rounded-lg border p-4 text-sm">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Accepted on
          </div>

          <div className="mt-1 font-medium">
            {new Date(acceptedAt).toLocaleString()}
          </div>
        </div>

        <div className="space-y-3 text-left">
          <h2 className="font-semibold">What happens next</h2>

          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>We&apos;ll send the advance payment invoice.</li>

            <li>We&apos;ll schedule a kickoff call.</li>

            <li>Development begins after payment confirmation.</li>
          </ul>
        </div>
      </Card>
    </main>
  );
}
