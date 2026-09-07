import Image from "next/image";

export default function GDGLoader({ label = "Loading" }) {
  return (
    <div
      className="editorial-loader"
      role="status"
      aria-live="polite"
    >
      <div className="editorial-loader-inner">
        <div className="editorial-loader-mark">
          <Image
            src="/assets/gdg-logo-loader.svg"
            alt=""
            width={52}
            height={52}
            priority
          />
        </div>
        <p>{label}</p>
        <small>GDG on Campus · VIT Chennai</small>
      </div>
    </div>
  );
}
