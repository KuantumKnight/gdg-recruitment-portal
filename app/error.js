"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center bg-[#f8f9fa] px-5 text-center text-[#202124]">
      <div className="max-w-lg rounded-[24px] border border-[#dadce0] bg-white px-8 py-10 shadow-[0_1px_2px_rgba(60,64,67,.08)]">
        <p className="text-sm font-medium text-[#d93025]">Something went wrong</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-.04em]">We couldn’t load this page.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#5f6368]">
          Try the request again. If the problem continues, return to the department browser and continue from there.
        </p>
        <button type="button" onClick={() => reset()} className="button-primary mt-7 px-6">Try again</button>
      </div>
    </main>
  );
}
