import { supabaseAdmin } from "@/lib/supabase-server";
import { calculateInvoice, InvoiceType } from "./calculateInvoice";
import { generateInvoiceNumber } from "./invoice-number";

interface GenerateInvoiceInput {
    quoteId: string;
    projectTotal: number;
    type: InvoiceType;
    advancePercent?: number;
    currency?: "INR" | "USD" | "AED" | "EUR" | "GBP";
    paymentMethod?:
    | "upi"
    | "bank_transfer"
    | "stripe"
    | "razorpay"
    | "cash"
    | "other";
    notes?: string;
}

export async function generateInvoice({
    quoteId,
    projectTotal,
    type,
    advancePercent = 50,
    currency = "INR",
    paymentMethod = "upi",
    notes,
}: GenerateInvoiceInput) {
    const calculation = calculateInvoice({
        projectTotal,
        type,
        advancePercent,
    });

    const invoiceNumber = await generateInvoiceNumber();

    const issueDate = new Date();
    const dueDate = new Date(issueDate);

    dueDate.setDate(dueDate.getDate() + 7);

    const receiptNumber =
        type === "receipt"
            ? `RCP-${invoiceNumber.replace("ZS-", "")}`
            : null;

    const { data, error } = await supabaseAdmin
        .from("invoices")
        .insert({
            quote_id: quoteId,

            invoice_number: invoiceNumber,
            receipt_number: receiptNumber,

            type,

            project_total: calculation.projectTotal,
            amount_due: calculation.amountDue,

            advance_percent: advancePercent,

            currency,
            payment_method: paymentMethod,
            notes,

            status: type === "receipt" ? "paid" : "pending",

            issue_date: issueDate.toISOString(),
            due_date: dueDate.toISOString(),

            paid_at: type === "receipt" ? issueDate.toISOString() : null,
        })
        .select()
        .single();

    if (error) throw error;

    return {
        invoice: data,
        calculation,
    };
}