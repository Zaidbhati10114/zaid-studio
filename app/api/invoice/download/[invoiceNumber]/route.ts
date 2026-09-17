import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { getStudioSettings } from "@/lib/studio/getStudioSettings";
import { calculateInvoice } from "@/lib/invoice/calculateInvoice";
import { createInvoicePdf } from "@/lib/invoice/createInvoicePdf";

export const runtime = "nodejs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ invoiceNumber: string }> }
) {
    const { invoiceNumber } = await params;

    const token = request.nextUrl.searchParams.get("t");

    if (!token) {
        return NextResponse.json(
            { error: "Missing invoice token." },
            { status: 401 }
        );
    }

    const { data: invoice } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("invoice_number", invoiceNumber)
        .eq("public_token", token)
        .single();

    if (!invoice) {
        return NextResponse.json(
            { error: "Invoice not found." },
            { status: 404 }
        );
    }

    const { data: quote } = await supabaseAdmin
        .from("quotes")
        .select("*")
        .eq("id", invoice.quote_id)
        .single();

    const studio = await getStudioSettings();

    const calculation = calculateInvoice({
        projectTotal: Number(invoice.project_total),
        type: invoice.type,
        advancePercent: invoice.advance_percent,
    });

    const pdf = await createInvoicePdf({
        studio,
        invoice,
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

    return new NextResponse(new Uint8Array(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
        },
    });
}