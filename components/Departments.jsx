export { default } from "./AllDepartments";
export function ReviewCard({ name, body }) {
  return (
    <figure>
      <figcaption>{name}</figcaption>
      <blockquote>{body}</blockquote>
    </figure>
  );
}
