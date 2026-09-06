import Image from "next/image";

export default function GDGLoader({ label = "Loading" }) {
  return (
    <div
      className="flex min-h-[240px] w-full items-center justify-center bg-[#101110] px-6 text-[#f3f1e9]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
          <Image
            src="/assets/gdg-logo-loader.svg"
            alt=""
            width={56}
            height={56}
            className="animate-pulse"
            priority
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-[#858b80]">GDG on Campus VIT Chennai</p>
        </div>
      </div>
    </div>
  );
}
