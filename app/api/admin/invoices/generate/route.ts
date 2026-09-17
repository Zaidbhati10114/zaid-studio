export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { getStudioSettings } from "@/lib/studio/getStudioSettings";
import { generateInvoice } from "@/lib/invoice/generateInvoice";
import { createInvoicePdf } from "@/lib/invoice/createInvoicePdf";

function parseAmount(value: string | number) {
    if (typeof value === "number") return value;

    return Number(String(value).replace(/[^\d.]/g, ""));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            quoteId,
            type,
            advancePercent = 50,
            currency = "INR",
            paymentMethod = "upi",
            notes,
        } = body;

        if (!quoteId || !type) {
            return NextResponse.json(
                {
                    error: "quoteId and type are required.",
                },
                { status: 400 }
            );
        }

        // Fetch quote

        const { data: quote, error: quoteError } = await supabaseAdmin
            .from("quotes")
            .select("*")
            .eq("id", quoteId)
            .single();

        if (quoteError || !quote) {
            return NextResponse.json(
                {
                    error: "Quote not found.",
                },
                { status: 404 }
            );
        }

        // Studio settings

        const studio = await getStudioSettings();

        // Calculate + save invoice

        const { invoice, calculation } = await generateInvoice({
            quoteId,
            projectTotal: parseAmount(quote.estimated_cost),
            type,
            advancePercent,
            currency,
            paymentMethod,
            notes,
        });

        // Generate PDF

        const pdfBuffer = await createInvoicePdf({
            studio,

            invoice: {
                invoice_number: invoice.invoice_number,
                receipt_number: invoice.receipt_number,
                type: invoice.type,
                status: invoice.status,
                issue_date: invoice.issue_date,
                due_date: invoice.due_date,
                currency: invoice.currency,
            },

            client: {
                name: quote.name,
                email: quote.email,
                company: quote.company,
            },

            project: {
                project_type: quote.project_type,
                summary: quote.summary,
            },

            calculation,
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,

                "X-Invoice-Id": invoice.id,
                "X-Invoice-Number": invoice.invoice_number,
            },
        });
    } catch (error) {
        console.error("[invoice.generate]", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate invoice.",
            },
            { status: 500 }
        );
    }
}