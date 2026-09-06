"use client";

import { useEffect } from "react";

export default function FirebaseAnalytics() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS !== "true") return;
    import("@/lib/firebase-client").then(({ initializeFirebaseAnalytics }) => {
      initializeFirebaseAnalytics().catch(() => {});
    });
  }, []);

  return null;
}
