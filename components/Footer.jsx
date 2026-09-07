import { ArrowOutward } from "@material-symbols-svg/react/icons/arrow-outward";
import { ORGANIZATION_NAME } from "@/lib/recruitment";

const socials = [
  ["Instagram", "https://www.instagram.com/gdg.vitc/"],
  ["Discord", "https://discord.gg/67G6bg4Xeq"],
  ["Email", "mailto:gdgvitc@gmail.com"],
  ["LinkedIn", "https://www.linkedin.com/company/gdg-vitc"],
  ["X", "https://x.com/gdg_vitc"],
];

export default function Footer() {
  return (
    <footer className="editorial-footer">
      <div className="editorial-footer-grid">
        <div className="editorial-footer-statement">
          <span className="editorial-footer-meta">{ORGANIZATION_NAME} · VIT Chennai</span>
          <h2>Make<br />something<br />matter.</h2>
        </div>
        <nav className="editorial-footer-links" aria-label="GDG VITC social links">
          {socials.map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"}>
              {label} <ArrowOutward size={18} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
