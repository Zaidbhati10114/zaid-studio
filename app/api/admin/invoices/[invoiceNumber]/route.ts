import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { getStudioSettings } from "@/lib/studio/getStudioSettings";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ invoiceNumber: string }> }
) {
    const { invoiceNumber } = await params;

    const { data: invoice, error } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("invoice_number", invoiceNumber)
        .single();

    if (error || !invoice) {
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

    return NextResponse.json({
        success: true,
        studio,
        invoice,
        quote,
    });
}