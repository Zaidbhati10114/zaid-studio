"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import { ProposalCard } from "../shared/ProposalCard";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";

export function CommercialTermsCard() {
  const { control } = useFormContext<ProposalForm>();

  return (
    <ProposalCard
      title="Commercial Terms"
      description="Support, payment and ownership terms for this proposal."
    >
      <div className="space-y-6">
        <Controller
          control={control}
          name="supportPolicy"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Support Policy</FieldLabel>

              <Textarea
                {...field}
                rows={4}
                placeholder="Describe the post-launch support included..."
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="paymentTerms"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Payment Terms</FieldLabel>

              <Textarea
                {...field}
                rows={4}
                placeholder="Describe how payments will be handled..."
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="ownershipTerms"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Ownership Terms</FieldLabel>

              <Textarea
                {...field}
                rows={4}
                placeholder="Describe ownership and intellectual property terms..."
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </ProposalCard>
  );
}
