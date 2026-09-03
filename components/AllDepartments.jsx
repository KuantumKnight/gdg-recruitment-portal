import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { departments } from "@/lib/catalog";
import s from "./Recruitment.module.css";
export default function AllDepartments() {
  return (
    <div className={s.grid}>
      {departments.map((d) => (
        <Link href="/departments" className={s.card} key={d.id}>
          <div className={s.cardTop}>
            <span style={{ color: d.color, fontSize: 28 }} aria-hidden="true">
              {d.category === "Technical" ? "</>" : "✳"}
            </span>
            <ArrowUpRight size={19} />
          </div>
          <h3>{d.displayName}</h3>
          <p>{d.description}</p>
          <span className={s.cardMeta}>{d.category}</span>
        </Link>
      ))}
    </div>
  );
}
