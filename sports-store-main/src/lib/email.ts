import nodemailer from "nodemailer";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "SportStore <no-reply@sportstore.com>";

  if (!host || !user || !pass) {
    console.log("==================================================");
    console.log(`📧 MOCK EMAIL SENT TO: ${to}`);
    console.log(`📧 SUBJECT: ${subject}`);
    console.log(`📧 CONTENT:\n${html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}`);
    console.log("==================================================");
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`📧 EMAIL SENT: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    // Return success: false, but don't crash the parent handler
    return { success: false, error };
  }
}
