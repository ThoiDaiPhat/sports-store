import { Resend } from "resend";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "SportStore <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  // If no Resend API key configured, fall back to console log
  if (!resendApiKey) {
    console.log("==================================================");
    console.log(`📧 MOCK EMAIL (No RESEND_API_KEY configured)`);
    console.log(`📧 TO: ${to}`);
    console.log(`📧 SUBJECT: ${subject}`);
    console.log(`📧 CONTENT:\n${html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}`);
    console.log("==================================================");
    return { success: true, mock: true };
  }

  try {
    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false, error };
    }

    console.log(`📧 EMAIL SENT via Resend: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    return { success: false, error };
  }
}
