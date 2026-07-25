"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { SectionCard } from "./SectionCard";
import { TaskList } from "./TaskList";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PhaseEditorProps {
  index: number;
  onRemove: () => void;
}

export function PhaseEditor({ index, onRemove }: PhaseEditorProps) {
  const { control } = useFormContext<ProposalForm>();

  return (
    <SectionCard
      title={`Phase ${index + 1}`}
      actions={
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Controller
          control={control}
          name={`phases.${index}.name`}
          render={({ field }) => <Input {...field} placeholder="Discovery" />}
        />

        <Controller
          control={control}
          name={`phases.${index}.duration`}
          render={({ field }) => <Input {...field} placeholder="1 week" />}
        />
      </div>

      <TaskList phaseIndex={index} />
    </SectionCard>
  );
}
