import Link from "next/link";
import { ArrowForward } from "@material-symbols-svg/react/icons/arrow-forward";
import { ArrowOutward } from "@material-symbols-svg/react/icons/arrow-outward";
import { isRecruitmentOpen } from "@/lib/recruitment";

const principles = [
  ["01", "Build real things", "Practical projects, visible outcomes, and work you can explain."],
  ["02", "Learn together", "Better questions, shared progress, and a generous community."],
  ["03", "Find your team", "Choose the domain where your curiosity already has momentum."],
  ["04", "Ship responsibly", "Own the details, listen closely, and iterate with intent."],
];

export default function Hero() {
  const open = isRecruitmentOpen();

  return (
    <section className="broadsheet-home" aria-labelledby="home-title">
      <div className="broadsheet-hero-grid">
        <aside className="hero-side-rail" aria-hidden="true"><span>GDG on Campus · VIT Chennai</span></aside>
        <div className="hero-story">
          <div className="hero-headline">
            <h1 id="home-title"><span>Build what</span><span>matters.</span></h1>
          </div>
          <div className="hero-standfirst">
            <h2>Learn with people who do.</h2>
            <span className="hero-rule" aria-hidden="true" />
            <p>Explore the teams behind GDG on Campus VIT Chennai, understand what each one works on, and choose where you want to contribute.</p>
            <a className="hero-how-link" href="https://docs.google.com/document/d/1nkCCHtfCWqLvFjlYgb5EmNG9xmhrsuUEDxEluKtO_Ug/edit?usp=sharing" target="_blank" rel="noreferrer">
              How recruitment works <ArrowOutward size={17} />
            </a>
          </div>
          <div className="hero-color-key" aria-hidden="true"><span /><span /><span /><span /></div>
        </div>
        <aside className="hero-action-plate">
          <span className="hero-action-number">01</span>
          <h2>Explore<br />teams.</h2>
          <div className="hero-actions">
            <Link href="/departments" className="hero-action-link primary">Explore teams <ArrowForward size={20} /></Link>
            <a href="https://docs.google.com/document/d/1nkCCHtfCWqLvFjlYgb5EmNG9xmhrsuUEDxEluKtO_Ug/edit?usp=sharing" target="_blank" rel="noreferrer" className="hero-action-link">
              Recruitment FAQs <ArrowOutward size={19} />
            </a>
          </div>
        </aside>
      </div>
      <div className="principles-band">
        <div className="principles-rail" aria-hidden="true">{open ? "Applications open" : "Recruitment archive"}</div>
        <div className="principles-list">
          {principles.map(([index, title, text]) => (
            <article className="principle-item" key={title}>
              <span className="principle-index">{index}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
