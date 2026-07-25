"use client";

import { Input } from "@/components/ui/input";

import { EditableList } from "./EditableList";

import { useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

interface TaskListProps {
  phaseIndex: number;
}

export function TaskList({ phaseIndex }: TaskListProps) {
  const { watch, setValue } = useFormContext<ProposalForm>();

  const tasks = watch(`phases.${phaseIndex}.tasks`) ?? [];

  function update(index: number, value: string) {
    const next = [...tasks];
    next[index] = value;

    setValue(`phases.${phaseIndex}.tasks`, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function add() {
    setValue(`phases.${phaseIndex}.tasks`, [...tasks, ""], {
      shouldDirty: true,
    });
  }

  function remove(index: number) {
    setValue(
      `phases.${phaseIndex}.tasks`,
      tasks.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      },
    );
  }

  return (
    <EditableList
      items={tasks}
      addLabel="Add Task"
      emptyMessage="No tasks added yet."
      onAdd={add}
      onRemove={remove}
      renderItem={(value, index) => (
        <Input
          value={value}
          placeholder="Describe this task..."
          onChange={(e) => update(index, e.target.value)}
        />
      )}
    />
  );
}
