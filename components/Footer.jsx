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
    <footer className="bg-[#121212]">
      <hr className="mx-5 h-[2px] rounded-full border-0 bg-[#252525]" />
      <div className="flex flex-col-reverse items-center justify-center px-10 pb-5 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-xl text-white">{ORGANIZATION_NAME}</p>
          <a href="mailto:gdgvitc@gmail.com" className="mt-1 block text-sm text-gray-400 transition-colors hover:text-white">{"//gdgvitc@gmail.com"}</a>
        </div>
        <div className="flex items-center justify-center gap-5 p-5" aria-label="GDG VITC social links">
          {socials.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"} aria-label={label} className="text-gray-300 transition-colors hover:text-white">
              <Icon size={20} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}