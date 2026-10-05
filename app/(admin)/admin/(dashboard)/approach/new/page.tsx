import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApproachForm } from "./approach-form";

export default function NewApproachPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/admin/approach" aria-label="Back to Approach">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Prospect
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a business and generate a personalized approach message.
          </p>
        </div>
      </div>

      <ApproachForm />
    </div>
  );
}
