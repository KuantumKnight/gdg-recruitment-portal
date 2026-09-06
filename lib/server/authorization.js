import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApiError } from "./api-error";
import { isInstitutionalEmail } from "../auth-policy";

export function assertSessionUser(session) {
  if (!session?.user?.id || !session.user.email || session.user.banned) {
    throw new ApiError(401, "Authentication required");
  }
  if (!isInstitutionalEmail(session.user.email)) throw new ApiError(403, "A VIT institutional email is required");
  return session.user;
}

export function assertAdminUser(user) {
  if (!String(user.role || "").split(",").map((role) => role.trim()).includes("admin")) {
    throw new ApiError(403, "Administrator access required");
  }
  return user;
}

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  return assertSessionUser(session);
}

export async function requireAdmin() {
  return assertAdminUser(await requireUser());
}

export function assertOwnEmail(request, user) {
  const email = new URL(request.url).searchParams.get("email");
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    throw new ApiError(403, "You can only access your own applications");
  }
}
