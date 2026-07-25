"use client";
import { Controller, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProposalCard } from "../components/layout/shared/ProposalCard";

export function TimelineCard() {
  const form = useFormContext<ProposalForm>();
  return (
    <ProposalCard
      title="Estimated Timeline"
      description="Overall delivery duration."
    >
      <Controller
        name="estimatedTimeline"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="timeline">Timeline</FieldLabel>

            <Input
              {...field}
              id="timeline"
              placeholder="6–8 weeks"
              aria-invalid={fieldState.invalid}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </ProposalCard>
  );
}
