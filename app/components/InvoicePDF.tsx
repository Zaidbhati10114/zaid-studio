import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface InvoicePDFProps {
  studio: {
    studio_name: string;
    owner_name: string;
    email: string;
    phone?: string;
    website: string;
    city?: string;
    country: string;
    upi_id?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    ifsc?: string;
  };

  invoice: {
    invoice_number: string;
    receipt_number?: string | null;
    type: "advance" | "final" | "receipt";
    status: "pending" | "paid";
    issue_date: string;
    due_date?: string | null;
    currency: string;
  };

  client: {
    name: string;
    email?: string;
    company?: string;
  };

  project: {
    project_type: string;
    summary: string;
  };

  calculation: {
    projectTotal: number;
    amountDue: number;
    advancePaid: number;
    remainingBalance: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 11,
    color: "#171717",
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  studioName: {
    fontSize: 22,
    fontWeight: "bold",
  },

  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "right",
  },

  badgePending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    padding: 5,
    borderRadius: 4,
    fontSize: 9,
    marginTop: 8,
    textAlign: "center",
  },

  badgePaid: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    padding: 5,
    borderRadius: 4,
    fontSize: 9,
    marginTop: 8,
    textAlign: "center",
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 14,
  },

  summaryBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
  },

  note: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    fontSize: 10,
    color: "#4B5563",
  },

  footer: {
    marginTop: 34,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 18,
    fontSize: 10,
    color: "#6B7280",
  },
});

export function InvoicePDF({
  studio,
  invoice,
  client,
  project,
  calculation,
}: InvoicePDFProps) {
  const isReceipt = invoice.type === "receipt";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.studioName}>{studio.studio_name}</Text>

            <Text>{studio.owner_name}</Text>

            <Text>{studio.email}</Text>

            {studio.phone && <Text>{studio.phone}</Text>}

            <Text>{studio.website}</Text>
          </View>

          <View>
            <Text style={styles.invoiceTitle}>
              {isReceipt ? "RECEIPT" : "INVOICE"}
            </Text>

            <Text>#{invoice.invoice_number}</Text>

            <Text>{new Date(invoice.issue_date).toLocaleDateString()}</Text>

            {!isReceipt && invoice.due_date && (
              <Text>
                Due: {new Date(invoice.due_date).toLocaleDateString()}
              </Text>
            )}

            <Text
              style={
                invoice.status === "paid"
                  ? styles.badgePaid
                  : styles.badgePending
              }
            >
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Bill To */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>

          <Text>{client.name}</Text>

          {client.company && <Text>{client.company}</Text>}

          {client.email && <Text>{client.email}</Text>}
        </View>

        {/* Project */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>

          <Text>{project.project_type}</Text>

          <Text>{project.summary}</Text>
        </View>

        {/* Payment Summary */}

        <View style={styles.summaryBox}>
          <View style={styles.row}>
            <Text>Project Total</Text>

            <Text>
              {invoice.currency} {calculation.projectTotal.toLocaleString()}
            </Text>
          </View>

          {invoice.type === "advance" && (
            <>
              <View style={styles.row}>
                <Text>Advance Payment</Text>

                <Text>
                  {invoice.currency} {calculation.amountDue.toLocaleString()}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>Remaining Balance</Text>

                <Text>
                  {invoice.currency}{" "}
                  {calculation.remainingBalance.toLocaleString()}
                </Text>
              </View>
            </>
          )}

          {invoice.type === "final" && (
            <>
              <View style={styles.row}>
                <Text>Advance Paid</Text>

                <Text>
                  {invoice.currency} {calculation.advancePaid.toLocaleString()}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>Final Payment Due</Text>

                <Text style={styles.total}>
                  {invoice.currency} {calculation.amountDue.toLocaleString()}
                </Text>
              </View>
            </>
          )}

          {invoice.type === "receipt" && (
            <View style={styles.row}>
              <Text>Payment Received</Text>

              <Text style={styles.total}>
                {invoice.currency} {calculation.amountDue.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}

        {!isReceipt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>

            {studio.upi_id && <Text>UPI: {studio.upi_id}</Text>}

            {studio.bank_name && <Text>{studio.bank_name}</Text>}

            {studio.account_name && <Text>{studio.account_name}</Text>}

            {studio.account_number && <Text>{studio.account_number}</Text>}

            {studio.ifsc && <Text>IFSC: {studio.ifsc}</Text>}
          </View>
        )}

        {/* Hosting Note */}

        <View style={styles.note}>
          <Text>
            Hosting: A free .vercel.app subdomain is included. If a custom
            domain (.com, .in, etc.) is required, the registration cost is paid
            by the client through their own account, and Zaid Studio will assist
            with setup.
          </Text>
        </View>

        {/* Footer */}

        <View style={styles.footer}>
          <Text>Thank you for choosing Zaid Studio.</Text>

          <Text>{studio.website}</Text>

          <Text>{studio.email}</Text>
        </View>
      </Page>
    </Document>
  );
}
