"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { createEmptyPhase } from "@/lib/proposals/defaults";

import { ProposalCard } from "../shared/ProposalCard";
import { PhaseEditor } from "../shared/PhaseEditor";

import { Button } from "@/components/ui/button";

export function PhasesCard() {
  const { control } = useFormContext<ProposalForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phases",
  });

  return (
    <ProposalCard
      title="Implementation Phases"
      description="Break the project into clear delivery stages."
    >
      <div className="space-y-6">
        {fields.map((field, index) => (
          <PhaseEditor
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append(createEmptyPhase())}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Phase
        </Button>
      </div>
    </ProposalCard>
  );
}
