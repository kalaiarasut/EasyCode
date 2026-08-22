import nodemailer from "nodemailer";
import dns from "node:dns";

// Force Node.js DNS resolver to prioritize IPv4 over IPv6 to prevent ENETUNREACH network errors
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Ignore if not supported in environment
}

const smtpEmail = (process.env.SMTP_EMAIL || process.env.EMAIL_USER || process.env.GMAIL_USER || "").trim();
// Remove spaces from Google App Password if copied with spaces (e.g. "abcd efgh ijkl mnop")
const rawPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "";
const smtpPassword = rawPassword.replace(/\s+/g, "").trim();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
} as any);

export const getFromEmail = () => {
  return smtpEmail ? `"EasyCode" <${smtpEmail}>` : `"EasyCode" <no-reply@easycode.dev>`;
};
