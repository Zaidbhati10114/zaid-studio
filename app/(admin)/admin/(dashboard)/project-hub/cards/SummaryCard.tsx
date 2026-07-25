"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";
import { ProposalCard } from "../components/layout/shared/ProposalCard";

export function SummaryCard() {
  const form = useFormContext<ProposalForm>();

  return (
    <ProposalCard
      title="Project Summary"
      description="A high-level overview of the project."
    >
      <Controller
        name="summary"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="summary">Summary</FieldLabel>

            <Textarea
              {...field}
              id="summary"
              rows={7}
              aria-invalid={fieldState.invalid}
              placeholder="Project summary..."
            />

            <FieldDescription>
              Explain the project in clear, client-friendly language.
            </FieldDescription>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </ProposalCard>
  );
}
