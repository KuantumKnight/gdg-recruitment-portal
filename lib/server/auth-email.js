import "server-only";
import nodemailer from "nodemailer";
import { after } from "next/server";

function mailConfig() {
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) throw new Error("Account email delivery is not configured");
  return { user, pass };
}

function queueAuthEmail({ to, subject, text }) {
  const { user, pass } = mailConfig();

  after(async () => {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    try {
      await transport.sendMail({
        from: user,
        to,
        subject,
        text,
        disableFileAccess: true,
        disableUrlAccess: true,
      });
    } catch (error) {
      console.error("Account email delivery failed", { name: error?.name, code: error?.code });
    } finally {
      transport.close();
    }
  });
}

export function queueVerificationEmail({ to, url }) {
  queueAuthEmail({
    to,
    subject: "Verify your GDG recruitment account",
    text: [
      "Verify your institutional email to continue with the GDG on Campus VIT Chennai recruitment portal.",
      "",
      url,
      "",
      "If you did not request this account, you can ignore this message.",
    ].join("\n"),
  });
}

export function queuePasswordResetEmail({ to, url }) {
  queueAuthEmail({
    to,
    subject: "Reset your GDG recruitment password",
    text: [
      "A password reset was requested for your GDG on Campus VIT Chennai recruitment account.",
      "",
      url,
      "",
      "If you did not request a password reset, you can ignore this message. The link expires automatically.",
    ].join("\n"),
  });
}
