import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101110] px-5 text-center text-[#f3f1e9]">
      <div className="max-w-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#d7fa70]">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#d7fa70]">404 · Route not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em]">This path isn’t part of the portal.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#a7aa9e]">The link may be old or incomplete. Return to the department browser to continue exploring the recruitment portal.</p>
        <Link href="/departments" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#d7fa70] px-5 py-3 text-sm font-bold text-[#101110]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to departments
        </Link>
      </div>
    </main>
  );
}
