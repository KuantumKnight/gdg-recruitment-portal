const configuredDomains = (process.env.VIT_EMAIL_DOMAINS || "vitstudent.ac.in,vit.ac.in")
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

export const institutionalEmailDomains = configuredDomains;

export function isInstitutionalEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return false;
  return configuredDomains.includes(value.slice(at + 1));
}
