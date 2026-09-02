import { connect } from "@/lib/db";
import { getDepartment } from "@/lib/catalog";
import { createApplicationSchema } from "@/lib/validation/application";
import { isRecruitmentOpen } from "@/lib/recruitment";
import { requireUser } from "@/lib/server/authorization";
import { ApiError, assertSameOrigin, errorResponse, privateJson, readJson } from "@/lib/server/api-error";
import { saveApplication } from "@/lib/server/applications";
export const dynamic = "force-dynamic";
export async function POST(request) {
  try {
    const user = await requireUser();
    assertSameOrigin(request);
    if (!isRecruitmentOpen()) throw new ApiError(403, "The submission deadline has passed.");
    const body = await readJson(request);
    const department = getDepartment(body?.Department);
    if (!department || department.name !== body.Department) throw new ApiError(400, "Choose a valid department.");
    const parsed = createApplicationSchema(department).safeParse(body);
    if (!parsed.success) throw new ApiError(422, "Please check your application.", parsed.error.flatten());
    const result = await saveApplication(await connect(), user, parsed.data);
    return privateJson({ ...result, message: result.duplicate ? "Your application was already received. Your original answers are unchanged." : "Application submitted successfully!" }, result.duplicate ? 200 : 201);
  } catch (error) { return errorResponse(error, "submit application"); }
}

