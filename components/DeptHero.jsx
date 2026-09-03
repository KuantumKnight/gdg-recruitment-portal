import s from "./Recruitment.module.css";
export default function DeptHero({ dept }) {
  return (
    <header>
      <p className={s.kicker}>Find your people</p>
      <h1 className={s.title}>{dept.displayName || dept.name}</h1>
      <p className={s.description}>{dept.description || dept.body}</p>
    </header>
  );
}
