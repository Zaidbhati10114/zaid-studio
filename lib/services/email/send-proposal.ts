import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendProposalEmailParams {
    to: string;

    subject: string;

    html: string;

    pdfBuffer: Buffer;

    filename: string;
}

export async function sendProposalEmail({
    to,
    subject,
    html,
    pdfBuffer,
    filename,
}: SendProposalEmailParams) {
    await transporter.sendMail({
        from: `"Zaid Studio" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,

        attachments: [
            {
                filename,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
}