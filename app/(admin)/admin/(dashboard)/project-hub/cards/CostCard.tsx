"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { ProposalCard } from "../../project-hub/components/layout/shared/ProposalCard";

export function CostCard() {
  const form = useFormContext<ProposalForm>();

  return (
    <ProposalCard
      title="Estimated Investment"
      description="Estimated project investment."
    >
      <Controller
        name="estimatedCost"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="cost">Estimated Cost</FieldLabel>

            <Input
              {...field}
              id="cost"
              placeholder="₹50,000 - ₹70,000"
              aria-invalid={fieldState.invalid}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </ProposalCard>
  );
}
