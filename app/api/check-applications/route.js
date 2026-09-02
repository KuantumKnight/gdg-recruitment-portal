import { connect } from "@/lib/db";
import { requireUser, assertOwnEmail } from "@/lib/server/authorization";
import { ownApplications } from "@/lib/server/applications";
import { errorResponse, privateJson } from "@/lib/server/api-error";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    const user = await requireUser();
    assertOwnEmail(request, user);
    const data = await ownApplications(await connect(), user);
    return privateJson({ count: data.length, submittedDepartments: data.map((item) => item.Department).filter(Boolean) });
  } catch (error) { return errorResponse(error, "check applications"); }
}
