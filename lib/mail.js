import { getDepartment } from "./catalog";

export function renderMailBody(body, recipient) {
  // One replacement pass: applicant data must never become template instructions.
  const text = body.replace(/#name|#dept/g, (token) => token === "#name"
    ? recipient.Name || "Applicant"
    : getDepartment(recipient.Department)?.displayName || "GDG on Campus");
  const escaped = text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  return { text, html: `<p>${escaped.replace(/\r\n|\r|\n/g, "<br>")}</p>` };
}


