

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePDF, type InvoicePDFProps } from "@/app/components/InvoicePDF";

export async function createInvoicePdf(props: InvoicePDFProps) {
    return renderToBuffer(
        React.createElement(InvoicePDF, props) as React.ReactElement<any>
    );
}
