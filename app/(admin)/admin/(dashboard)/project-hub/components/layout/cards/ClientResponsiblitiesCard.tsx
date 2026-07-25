"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { EditableList } from "../shared/EditableList";
import { ProposalCard } from "../shared/ProposalCard";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

export function ClientResponsibilitiesCard() {
  const { watch, setValue } = useFormContext<ProposalForm>();

  const responsibilities = watch("clientResponsibilities") ?? [];

  function update(index: number, value: string) {
    const next = [...responsibilities];
    next[index] = value;

    setValue("clientResponsibilities", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function add() {
    setValue("clientResponsibilities", [...responsibilities, ""], {
      shouldDirty: true,
    });
  }

  function remove(index: number) {
    setValue(
      "clientResponsibilities",
      responsibilities.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      },
    );
  }

  return (
    <ProposalCard
      title="Client Responsibilities"
      description="Items the client should provide or complete during the project."
    >
      <EditableList
        items={responsibilities}
        addLabel="Add Responsibility"
        emptyMessage="No responsibilities added yet."
        onAdd={add}
        onRemove={remove}
        renderItem={(value, index) => (
          <Input
            value={value}
            placeholder="e.g. Provide logo files"
            onChange={(e) => update(index, e.target.value)}
          />
        )}
      />
    </ProposalCard>
  );
}
