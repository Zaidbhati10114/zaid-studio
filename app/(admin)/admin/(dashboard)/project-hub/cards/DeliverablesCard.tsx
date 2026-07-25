"use client";

import { Controller, useFormContext } from "react-hook-form";

import type { ProposalForm } from "@/lib/validation/proposal-schema";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { InputGroupTextarea } from "@/components/ui/input-group";

import { ProposalCard } from "../../project-hub/components/layout/shared/ProposalCard";
export function DeliverablesCard() {
  const form = useFormContext<ProposalForm>();
  return (
    <ProposalCard title="Deliverables" description="One deliverable per line.">
      <Controller
        name="deliverables"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="deliverables">Deliverables</FieldLabel>

            <InputGroupTextarea
              id="deliverables"
              rows={8}
              value={(field.value ?? []).join("\n")}
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              aria-invalid={fieldState.invalid}
              placeholder="Responsive website&#10;Contact form&#10;Admin dashboard"
            />

            <FieldDescription>Enter one deliverable per line.</FieldDescription>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </ProposalCard>
  );
}
