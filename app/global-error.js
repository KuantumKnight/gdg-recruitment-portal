"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body className="bg-[#101110] text-[#f3f1e9]">
        <main className="grid min-h-screen place-items-center px-5 text-center">
          <div>
            <h1 className="text-4xl font-semibold">The portal needs a restart.</h1>
            <p className="mt-4 text-sm text-[#a7aa9e]">An unexpected error interrupted this page.</p>
            <button type="button" onClick={() => reset()} className="mt-8 rounded-full bg-[#d7fa70] px-5 py-3 text-sm font-bold text-[#101110]">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
