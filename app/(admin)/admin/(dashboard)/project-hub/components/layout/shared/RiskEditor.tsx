"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { SectionCard } from "./SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

interface RiskEditorProps {
  index: number;
  onRemove: () => void;
}

export function RiskEditor({ index, onRemove }: RiskEditorProps) {
  const { control } = useFormContext<ProposalForm>();

  return (
    <SectionCard
      title={`Risk ${index + 1}`}
      actions={
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    >
      <Controller
        control={control}
        name={`risks.${index}.risk`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Risk</FieldLabel>

            <Input {...field} placeholder="Describe the project risk..." />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name={`risks.${index}.mitigation`}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Mitigation</FieldLabel>

            <Textarea
              {...field}
              rows={4}
              placeholder="Describe how this risk will be mitigated..."
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </SectionCard>
  );
}
