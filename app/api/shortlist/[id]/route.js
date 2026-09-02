import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/server/authorization";
import { ApiError, assertSameOrigin, errorResponse, privateJson, readJson } from "@/lib/server/api-error";
import { documentData } from "@/lib/server/applications";
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    assertSameOrigin(request);
    const { id } = await params;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new ApiError(400, "Invalid applicant ID.");
    const body = await readJson(request, 1024);
    if (typeof body.shortlisted !== "boolean" || Object.keys(body).length !== 1) throw new ApiError(422, "Provide a shortlisted boolean.");
    const db = await connect();
    const ref = db.collection("formData").doc(id);
    const data = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw new ApiError(404, "Applicant not found.");
      transaction.update(ref, { shortlisted: body.shortlisted });
      return { ...documentData(snapshot), shortlisted: body.shortlisted };
    });
    return privateJson({ success: true, data: serializeFirestoreData(data) });
  } catch (error) { return errorResponse(error, "shortlist applicant"); }
}
