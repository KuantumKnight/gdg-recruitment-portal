import { z } from "zod";

export const mailRequestSchema = z.object({
  recipients: z.array(z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/) }).strict())
    .min(1).max(50)
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, "Select each applicant only once."),
  payloadData: z.object({
    subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/, "Subject must be one line."),
    body: z.string().trim().min(1).max(3000),
  }).strict(),
}).strict();

export const mailRecipientSchema = z.object({
  Name: z.string().max(500).optional().default("Applicant"),
  Email: z.string().trim().email().max(254),
  Department: z.string().max(200).optional().default(""),
});


