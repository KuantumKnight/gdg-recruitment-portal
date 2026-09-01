// Draft content is untrusted device storage. Keep only bounded string fields.
const details = [
  "Name",
  "RegistrationNumber",
  "Phone",
  "Gender",
  "Year of Study",
  "motivation",
];
export function applicationDraftKey(userId, departmentIds) {
  return `gdg-application:v2:${userId}:${[...departmentIds].sort().join(":")}`;
}
export function readApplicationDraft(serialized, allowedAnswerIds) {
  const draft = JSON.parse(serialized || "null");
  if (!draft?.values || typeof draft.values !== "object") return null;
  const values = Object.fromEntries(
    details
      .filter((key) => typeof draft.values[key] === "string")
      .map((key) => [key, draft.values[key].slice(0, 6000)]),
  );
  values.answers = Object.fromEntries(
    allowedAnswerIds
      .filter((key) => typeof draft.values.answers?.[key] === "string")
      .map((key) => [key, draft.values.answers[key].slice(0, 6000)]),
  );
  return values;
}
