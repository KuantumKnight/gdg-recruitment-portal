"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center bg-[#101110] px-5 text-center text-[#f3f1e9]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">Something went sideways</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em]">We couldn’t load this page.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#a7aa9e]">Try again, or head back to departments while we recover your place.</p>
        <button type="button" onClick={() => reset()} className="mt-8 rounded-full bg-[#d7fa70] px-5 py-3 text-sm font-bold text-[#101110]">Try again</button>
      </div>
    </main>
  );
}
