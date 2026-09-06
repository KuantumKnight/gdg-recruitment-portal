import { Instagram, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";
import { ORGANIZATION_NAME } from "@/lib/recruitment";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/gdg.vitc/", icon: Instagram },
  { label: "Discord", href: "https://discord.gg/67G6bg4Xeq", icon: MessageCircle },
  { label: "Email", href: "mailto:gdgvitc@gmail.com", icon: Mail },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/gdg-vitc", icon: Linkedin },
  { label: "X", href: "https://x.com/gdg_vitc", icon: Twitter },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e8eaed] bg-[#f8f9fa]">
      <div className="page-shell flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#202124]">{ORGANIZATION_NAME}</p>
          <p className="mt-1 text-xs text-[#80868b]">Recruitment Portal · VIT Chennai</p>
        </div>
        <div className="flex items-center gap-1" aria-label="GDG VITC social links">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
              aria-label={label}
              className="rounded-full p-2.5 text-[#5f6368] transition-colors hover:bg-[#e8eaed] hover:text-[#202124]"
            >
              <Icon size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
