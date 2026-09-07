"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#202124]">
        <main className="utility-page">
          <div className="utility-poster">
            <p className="auth-poster-meta">System desk · Error</p>
            <h2>Signal lost.</h2>
            <p className="auth-poster-meta">GDG on Campus · VIT Chennai</p>
          </div>
          <div className="utility-panel">
            <p className="eyebrow">Portal error</p>
            <h1>The portal needs a restart.</h1>
            <p>An unexpected error interrupted this page.</p>
            <button type="button" onClick={() => reset()} className="button-primary mt-7 px-6">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
