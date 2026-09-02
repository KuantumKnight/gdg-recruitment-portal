import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/server/authorization";
import { ApiError, errorResponse, privateJson } from "@/lib/server/api-error";
import { documentData } from "@/lib/server/applications";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const limit = Number(params.get("limit") || 50);
    const cursor = params.get("cursor");
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || (cursor && !/^[A-Za-z0-9_-]{1,128}$/.test(cursor))) throw new ApiError(400, "Invalid pagination parameters.");
    const db = await connect();
    let query = db.collection("formData").orderBy("__name__");
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.limit(limit + 1).get();
    const docs = snapshot.docs.slice(0, limit);
    const hasMore = snapshot.docs.length > limit;
    return privateJson({ applicants: serializeFirestoreData(docs.map(documentData)), hasMore, nextCursor: hasMore ? docs.at(-1).id : null });
  } catch (error) { return errorResponse(error, "list applicants"); }
}
