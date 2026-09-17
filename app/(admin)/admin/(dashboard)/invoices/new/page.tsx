import { Suspense } from "react";
import { InvoiceGeneratorForm } from "../components/InvoiceGenerationForm";

export default function NewInvoicePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 pb-12 pt-28">
      <Suspense fallback={<div>Loading invoice generator...</div>}>
        <InvoiceGeneratorForm />
      </Suspense>
    </main>
  );
}
