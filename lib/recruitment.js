export const ORGANIZATION_NAME = "GDG on Campus";
export const MAX_APPLICATIONS = 2;
// The engineering submission deadline is not the recruitment deadline.
export const RECRUITMENT_DEADLINE = process.env.NEXT_PUBLIC_RECRUITMENT_DEADLINE || "2026-08-23T23:59:59+05:30";

export function isRecruitmentOpen(now = new Date(), deadline = RECRUITMENT_DEADLINE) {
  const closesAt = new Date(deadline).getTime();
  return Number.isFinite(closesAt) && new Date(now).getTime() <= closesAt;
}
