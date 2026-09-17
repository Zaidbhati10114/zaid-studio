import { supabaseAdmin } from "@/lib/supabase-server";

export async function generateInvoiceNumber() {
    const { data, error } = await supabaseAdmin.rpc(
        "generate_invoice_number"
    );

    if (error) {
        throw error;
    }

    return data as string;
}