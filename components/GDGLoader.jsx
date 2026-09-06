import Image from "next/image";

export default function GDGLoader({ label = "Loading" }) {
  return (
    <div
      className="flex min-h-[240px] w-full items-center justify-center bg-[#f8f9fa] px-6 text-[#202124]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl border border-[#dadce0] bg-white p-4 shadow-[0_1px_2px_rgba(60,64,67,.08)]">
          <Image
            src="/assets/gdg-logo-loader.svg"
            alt=""
            width={52}
            height={52}
            className="animate-pulse"
            priority
          />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-[#80868b]">GDG on Campus VIT Chennai</p>
        </div>
      </div>
    </div>
  );
}
