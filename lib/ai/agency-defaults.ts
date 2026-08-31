// lib/ai/agency-defaults.ts
export interface AgencyDefaults {
    supportPolicy: string;
    paymentTerms: string;
    ownershipTerms: string;
}


export const AGENCY_DEFAULTS: AgencyDefaults = {
    supportPolicy: `
30 days of complimentary bug-fix support after final delivery.

This includes fixing issues directly related to the agreed project scope.

Feature additions or scope changes are quoted separately.
`.trim(),

    paymentTerms: `
• 50% advance before development begins.

• 50% before final deployment or source code handover.

• Any additional features requested after approval are billed separately.
`.trim(),

    ownershipTerms: `
Once the project is fully paid, ownership of the agreed deliverables and source code is transferred to the client.

Third-party services, APIs, fonts, plugins and software remain subject to their own licenses.
`.trim(),
};