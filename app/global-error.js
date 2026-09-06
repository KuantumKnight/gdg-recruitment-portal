"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body className="bg-[#f8f9fa] text-[#202124]">
        <main className="grid min-h-screen place-items-center px-5 text-center">
          <div className="max-w-lg rounded-[24px] border border-[#dadce0] bg-white px-8 py-10 shadow-[0_1px_2px_rgba(60,64,67,.08)]">
            <p className="text-sm font-medium text-[#d93025]">Portal error</p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-.04em]">The portal needs a restart.</h1>
            <p className="mt-4 text-sm leading-6 text-[#5f6368]">An unexpected error interrupted this page.</p>
            <button type="button" onClick={() => reset()} className="mt-7 rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#185abc]">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
