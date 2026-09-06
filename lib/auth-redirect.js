const FALLBACK_CALLBACK_URL = "/";

export function safeCallbackURL(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return FALLBACK_CALLBACK_URL;
  return value;
}