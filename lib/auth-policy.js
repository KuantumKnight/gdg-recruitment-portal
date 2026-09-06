export const INSTITUTIONAL_DOMAIN = "vitstudent.ac.in";
export const institutionalEmailDomains = [INSTITUTIONAL_DOMAIN];

export function isInstitutionalEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return false;
  return value.slice(at + 1) === INSTITUTIONAL_DOMAIN;
}

export function isVerifiedInstitutionalUser(user) {
  return Boolean(user?.emailVerified === true && isInstitutionalEmail(user?.email));
}
