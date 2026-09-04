import nodemailer from "nodemailer";
import { connect } from "@/lib/db";
import { requireAdmin } from "@/lib/server/authorization";
import { ApiError, assertSameOrigin, errorResponse, privateJson, readJson } from "@/lib/server/api-error";
import { renderMailBody } from "@/lib/mail";
import { mailRequestSchema, mailRecipientSchema } from "@/lib/server/mail-schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const parsed = mailRequestSchema.safeParse(await readJson(request, 32 * 1024));
    if (!parsed.success) throw new ApiError(422, "Check the recipients, subject and message.");
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new ApiError(503, "Email delivery is not configured. Contact the site administrator.");
    }

    const { recipients, payloadData } = parsed.data;
    const db = await connect();
    // Resolve and validate the entire batch before the first email side effect.
    const snapshots = await db.getAll(...recipients.map(({ id }) => db.collection("formData").doc(id)));
    const messages = snapshots.map((snapshot) => {
      if (!snapshot.exists) throw new ApiError(404, "A selected application no longer exists. Refresh the applicant list.");
      const recipient = mailRecipientSchema.safeParse(snapshot.data());
      if (!recipient.success) throw new ApiError(422, "A selected application has invalid contact information. No messages were sent.");
      return { id: snapshot.id, recipient: recipient.data };
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    const acceptedIds = [];
    try {
      for (let index = 0; index < messages.length; index++) {
        const { id, recipient } = messages[index];
        try {
          const info = await transport.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: recipient.Email,
            subject: payloadData.subject,
            ...renderMailBody(payloadData.body, recipient),
            disableFileAccess: true, disableUrlAccess: true,
          });
          if (!info.accepted?.some((address) => String(address).toLowerCase() === recipient.Email.toLowerCase())) {
            throw new Error("Recipient not accepted by email provider");
          }
          acceptedIds.push(id);
        } catch {
          // SMTP can accept a message before a connection fails. Never automatically retry.
          return privateJson({
            message: "Delivery stopped. Check the email provider records before retrying; the last message may have been accepted.",
            acceptedIds, uncertainId: id, unattemptedIds: messages.slice(index + 1).map((item) => item.id),
          }, 502);
        }
      }
      return privateJson({
        message: `${acceptedIds.length} message(s) accepted by the email provider. Inbox delivery is not guaranteed.`,
        acceptedIds,
      });
    } finally {
      transport.close();
    }
  } catch (error) {
    return errorResponse(error, "send applicant email");
  }
}


