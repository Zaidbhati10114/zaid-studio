"use client";

import { Input } from "@/components/ui/input";

import { ProposalCard } from "../shared/ProposalCard";
import { EditableList } from "../shared/EditableList";

import { useFormContext } from "react-hook-form";
import type { ProposalForm } from "@/lib/validation/proposal-schema";

export function TechStackCard() {
  const { watch, setValue } = useFormContext<ProposalForm>();

  const techStack = watch("techStack") ?? [];

  function update(index: number, value: string) {
    const next = [...techStack];
    next[index] = value;

    setValue("techStack", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function add() {
    setValue("techStack", [...techStack, ""], {
      shouldDirty: true,
    });
  }

  function remove(index: number) {
    setValue(
      "techStack",
      techStack.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      },
    );
  }

  return (
    <ProposalCard
      title="Tech Stack"
      description="Recommended technologies for this project."
    >
      <EditableList
        items={techStack}
        addLabel="Add Technology"
        emptyMessage="No technologies added yet."
        onAdd={add}
        onRemove={remove}
        renderItem={(value, index) => (
          <Input
            value={value}
            placeholder="e.g. Next.js"
            onChange={(e) => update(index, e.target.value)}
          />
        )}
      />
    </ProposalCard>
  );
}
