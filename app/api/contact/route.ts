import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            email,
            company,
            message,
            website, // honeypot
        } = body;

        if (website) {
            return NextResponse.json({ success: true });
        }

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Zaid Studio Contact Form" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER,
            subject: `New enquiry from ${name}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2>New Contact Form Submission</h2>

          <hr />

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "Not provided"}</p>

          <p><strong>Message:</strong></p>

          <div
            style="
              background:#f5f5f5;
              padding:12px;
              border-radius:8px;
              white-space:pre-wrap;
            "
          >
            ${message}
          </div>
        </div>
      `,
        });

        await transporter.sendMail({
            from: `"Zaid Studio" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Thanks for contacting Zaid Studio",
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2>Thanks for reaching out 👋</h2>

          <p>
            Hi ${name},
          </p>

          <p>
            I've received your message and will get back to you
            as soon as possible.
          </p>

          <p>
            If your enquiry is urgent, feel free to reach out
            through WhatsApp as well.
          </p>

          <p>
            — Zaid Studio
          </p>
        </div>
      `,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to send message",
            },
            {
                status: 500,
            },
        );
    }
}