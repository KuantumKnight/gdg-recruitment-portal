import { connect } from "@/lib/db";
import { getDepartment } from "@/lib/catalog";
import { requireUser, assertOwnEmail } from "@/lib/server/authorization";
import { ownApplications } from "@/lib/server/applications";
import { ApiError, errorResponse, privateJson } from "@/lib/server/api-error";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    const user = await requireUser();
    assertOwnEmail(request, user);
    const department = getDepartment(new URL(request.url).searchParams.get("department"));
    if (!department) throw new ApiError(400, "Choose a valid department.");
    const data = await ownApplications(await connect(), user);
    return privateJson({ submitted: data.some((item) => item.Department === department.name) });
  } catch (error) { return errorResponse(error, "check department"); }
}
