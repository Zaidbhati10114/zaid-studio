export type InvoiceType = "advance" | "final" | "receipt";

interface CalculateInvoiceInput {
    projectTotal: number;
    type: InvoiceType;
    advancePercent?: number;
}

export interface InvoiceCalculation {
    projectTotal: number;
    amountDue: number;
    advancePaid: number;
    remainingBalance: number;
}

export function calculateInvoice({
    projectTotal,
    type,
    advancePercent = 50,
}: CalculateInvoiceInput): InvoiceCalculation {
    switch (type) {
        case "advance": {
            const amountDue = Math.round(projectTotal * advancePercent / 100);

            return {
                projectTotal,
                amountDue,
                advancePaid: 0,
                remainingBalance: projectTotal - amountDue,
            };
        }

        case "final": {
            const advancePaid = Math.round(projectTotal * advancePercent / 100);

            return {
                projectTotal,
                amountDue: projectTotal - advancePaid,
                advancePaid,
                remainingBalance: 0,
            };
        }

        case "receipt":
            return {
                projectTotal,
                amountDue: projectTotal,
                advancePaid: projectTotal,
                remainingBalance: 0,
            };
    }
}