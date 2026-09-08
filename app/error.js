"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="utility-page">
      <div className="utility-poster">
        <p className="auth-poster-meta">System desk · Error</p>
        <h2>Signal lost.</h2>
        <p className="auth-poster-meta">Your answers remain yours</p>
      </div>
      <div className="utility-panel">
        <p className="eyebrow">Something went wrong</p>
        <h1>We couldn’t load this page.</h1>
        <p>
          Try the request again. If the problem continues, return to the department browser and continue from there.
        </p>
        <button type="button" onClick={() => reset()} className="button-primary mt-7 px-6">Try again</button>
      </div>
    </main>
  );
}
