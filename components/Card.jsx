import s from "./Recruitment.module.css";
export default function Card({ title, description, bgColor, Icon }) {
  return (
    <article className={s.card}>
      <div className={s.cardTop}>
        {Icon && (
          <span className={s.icon} style={{ color: bgColor || "#d7fa70" }}>
            <Icon size={24} />
          </span>
        )}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
