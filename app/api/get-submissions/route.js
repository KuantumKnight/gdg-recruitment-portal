import { connect, serializeFirestoreData } from "@/lib/db";
import { requireUser, assertOwnEmail } from "@/lib/server/authorization";
import { ownApplications } from "@/lib/server/applications";
import { errorResponse, privateJson } from "@/lib/server/api-error";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    const user = await requireUser();
    assertOwnEmail(request, user);
    return privateJson({ data: serializeFirestoreData(await ownApplications(await connect(), user)) });
  } catch (error) { return errorResponse(error, "read submissions"); }
}
