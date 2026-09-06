import { createHash } from "node:crypto";

export function normalizeRegistrationNumber(value) {
  return String(value || "").trim().toUpperCase();
}

export function registrationIdentityKey(value) {
  return createHash("sha256").update(normalizeRegistrationNumber(value)).digest("hex");
}
