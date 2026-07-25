"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { ProposalCard } from "../shared/ProposalCard";
import { EditableList } from "../shared/EditableList";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

export function NextStepsCard() {
  const { watch, setValue } = useFormContext<ProposalForm>();

  const nextSteps = watch("nextSteps") ?? [];

  function update(index: number, value: string) {
    const next = [...nextSteps];
    next[index] = value;

    setValue("nextSteps", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function add() {
    setValue("nextSteps", [...nextSteps, ""], {
      shouldDirty: true,
    });
  }

  function remove(index: number) {
    setValue(
      "nextSteps",
      nextSteps.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      },
    );
  }

  return (
    <ProposalCard
      title="Next Steps"
      description="Recommended actions after the client approves this proposal."
    >
      <EditableList
        items={nextSteps}
        addLabel="Add Next Step"
        emptyMessage="No next steps added yet."
        onAdd={add}
        onRemove={remove}
        renderItem={(value, index) => (
          <Input
            value={value}
            placeholder="e.g. Schedule project kickoff meeting"
            onChange={(e) => update(index, e.target.value)}
          />
        )}
      />
    </ProposalCard>
  );
}
