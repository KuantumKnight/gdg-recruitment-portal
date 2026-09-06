import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f9fa] px-5 text-center text-[#202124]">
      <div className="max-w-lg rounded-[24px] border border-[#dadce0] bg-white px-8 py-10 shadow-[0_1px_2px_rgba(60,64,67,.08)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-medium text-[#1a73e8]">404 · Page not found</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-.04em]">This page isn’t part of the portal.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#5f6368]">
          The link may be old or incomplete. Return to the team browser to continue exploring recruitment.
        </p>
        <Link href="/departments" className="button-primary mt-7 px-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to departments
        </Link>
      </div>
    </main>
  );
}
