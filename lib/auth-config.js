const DEFAULT_PRODUCTION_URL = "https://gdg-recruitment-portal-omega.vercel.app";

function normalizeURL(value) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    if (!['http:', 'https:'].includes(url.protocol)) return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function getAuthBaseURL(env = process.env) {
  const configuredURL = normalizeURL(env.BETTER_AUTH_URL);
  if (configuredURL) return configuredURL;

  const productionURL = normalizeURL(env.VERCEL_PROJECT_PRODUCTION_URL || env.NEXT_PUBLIC_SITE_URL);
  if (productionURL) return productionURL;

  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    return DEFAULT_PRODUCTION_URL;
  }

  return "http://localhost:3000";
}
