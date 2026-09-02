import { z } from "zod";

export const MOTIVATION_QUESTION = "Why do you want to join GDG on Campus?";
export const MAX_ANSWER_LENGTH = 6000;

export const applicantDetailsSchema = z.object({
  Name: z.string().trim().min(2, "Enter your full name").max(120),
  RegistrationNumber: z.string().trim().toUpperCase().regex(/^\d{2}[A-Z]{3}\d{4}$/, "Use a registration number such as 25BCE5612"),
  Email: z.string().email().optional(),
  Phone: z.string().trim().transform((value) => value.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^\d{10}$/, "Enter a 10-digit phone number")),
  Gender: z.enum(["", "Male", "Female", "Other", "Prefer not to say"]).optional(),
  "Year of Study": z.enum(["", "1", "2", "3", "4", "5"]).optional(),
});

export function createApplicationSchema(department) {
  const questions = Object.fromEntries([
    [MOTIVATION_QUESTION, z.string().trim().min(1, "Tell us why you want to join").max(MAX_ANSWER_LENGTH)],
    ...department.questions.map((question) => [
      question.name,
      question.required === false
        ? z.string().trim().max(MAX_ANSWER_LENGTH).optional().default("")
        : z.string().trim().min(1, "Please answer this question").max(MAX_ANSWER_LENGTH),
    ]),
  ]);
  return applicantDetailsSchema.extend({
    Department: z.literal(department.name),
    Pref: z.enum(["1", "2"]).optional(),
    Questions: z.object(questions).strict(),
  }).strict();
}

// UI field paths use opaque IDs: punctuation in original question text must
// never be interpreted as React Hook Form object paths.
export function buildSubmissionPayload(department, values, preference) {
  return {
    Name: values.Name, RegistrationNumber: values.RegistrationNumber,
    Phone: values.Phone, Gender: values.Gender || "",
    "Year of Study": values["Year of Study"] || "",
    Department: department.name, Pref: String(preference),
    Questions: {
      [MOTIVATION_QUESTION]: values.motivation || "",
      ...Object.fromEntries(department.questions.map((question) => [question.name, values.answers?.[`${department.id}:${question.id}`] || ""])),
    },
  };
}
