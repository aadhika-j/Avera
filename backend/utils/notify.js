import nodemailer from "nodemailer";
import twilio from "twilio";

const twilioClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const mailer = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export const sendSms = async (to, body) => {
  if (!to) return;
  const client = twilioClient();
  await client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to, body });
};

export const sendWhatsapp = async (to, body) => {
  if (!to) return;
  const client = twilioClient();
  await client.messages.create({
    from: `whatsapp:${process.env.WHATSAPP_SANDBOX_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  });
};

/**
 * Send an email.  When `html` is supplied the recipient will see the themed
 * HTML version; the plain-text `text` acts as a fallback for mail clients
 * that do not render HTML.
 */
export const sendEmail = async (to, subject, text, html) => {
  if (!to) return;
  const transporter = mailer();
  await transporter.sendMail({
    from: `"AVERA" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
};
