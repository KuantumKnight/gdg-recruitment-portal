import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const options = projectId ? { projectId } : {};
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (projectId && clientEmail && privateKey) options.credential = cert({ projectId, clientEmail, privateKey });
const app = getApps()[0] || initializeApp(options);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: firestoreAdapter({ firestore: getFirestore(app) }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  emailAndPassword: { enabled: true },
  ...(googleConfigured ? { socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } } } : {}),
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()],
});
