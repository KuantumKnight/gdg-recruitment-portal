import { initializeApp, cert, getApps, type AppOptions } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const hasServiceAccount = Boolean(projectId && clientEmail && privateKey);
const hasEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const hasApplicationCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

type FirestoreCache = { db: ReturnType<typeof getFirestore> | null };
const globalStore = globalThis as typeof globalThis & { __gdgFirestore?: FirestoreCache };
const cache = globalStore.__gdgFirestore ??= { db: null };

export async function connect() {
  if (!hasServiceAccount && !hasApplicationCredentials && !hasEmulator && process.env.NODE_ENV === "production" && !process.env.BUILDING) {
    throw new Error("Firestore credentials are not configured");
  }
  if (cache.db) return cache.db;
  const options: AppOptions = projectId ? { projectId } : {};
  if (hasServiceAccount) options.credential = cert({ projectId, clientEmail, privateKey });
  const app = getApps()[0] || initializeApp(options);
  cache.db = getFirestore(app);
  return cache.db;
}

export function serializeFirestoreData(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as { toDate?: unknown })?.toDate === "function") return (value as { toDate: () => Date }).toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeFirestoreData);
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeFirestoreData(item)]));
  return value;
}


