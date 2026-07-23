import nodemailer from "nodemailer";

const REQUIRED_ENV = ["EMAIL_SERVER_HOST", "EMAIL_SERVER_USER", "EMAIL_SERVER_PASSWORD", "EMAIL_FROM"] as const;
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(`[EMAIL] Missing environment variable(s): ${missingEnv.join(", ")}`);
}

const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

transporter.verify().then(
  () => console.log("[EMAIL] SMTP connection verified"),
  (err) => console.error("[EMAIL] SMTP verify failed:", err)
);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_APP_NAME ?? "EduAI Platform"}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log("[EMAIL] Sent to", to);
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send to", to, error);
    return false;
  }
}