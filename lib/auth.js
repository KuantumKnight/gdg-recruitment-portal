import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { INSTITUTIONAL_DOMAIN, isInstitutionalEmail } from "@/lib/auth-policy";
import { getAuthBaseURL } from "@/lib/auth-config";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const options = projectId ? { projectId } : {};
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (projectId && clientEmail && privateKey) options.credential = cert({ projectId, clientEmail, privateKey });
const app = getApps()[0] || initializeApp(options);

export const auth = betterAuth({
  baseURL: getAuthBaseURL(),
  database: firestoreAdapter({ firestore: getFirestore(app) }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    validateUserInfo: ({ user, source }) => {
      if (source.oauth?.providerId !== "google") {
        return {
          error: "google_only",
          errorDescription: "Use your VIT Google account to sign in.",
        };
      }
      if (!isInstitutionalEmail(user.email)) {
        return {
          error: "email_not_allowed",
          errorDescription: `Use your @${INSTITUTIONAL_DOMAIN} Google account.`,
        };
      }
    },
  },
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            hd: INSTITUTIONAL_DOMAIN,
            prompt: "select_account",
            requireEmailVerification: true,
          },
        },
      }
    : {}),
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()],
});
