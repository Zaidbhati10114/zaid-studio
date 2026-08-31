"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { createEmptyRisk } from "@/lib/proposals/defaults";

import { ProposalCard } from "../shared/ProposalCard";
import { RiskEditor } from "../shared/RiskEditor";

import { Button } from "@/components/ui/button";

interface RisksCardProps {
  readOnly?: boolean;
}

export function RisksCard({ readOnly = false }: RisksCardProps) {
  const { control } = useFormContext<ProposalForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "risks",
  });

  return (
    <ProposalCard
      title="Project Risks"
      description="Potential project risks and how they will be mitigated."
    >
      <div className="space-y-6">
        {fields.map((field, index) => (
          <RiskEditor
            key={field.id}
            index={index}
            readOnly={readOnly}
            onRemove={() => remove(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append(createEmptyRisk())}
          disabled={readOnly}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Risk
        </Button>
      </div>
    </ProposalCard>
  );
}
