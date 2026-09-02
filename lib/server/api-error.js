export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function errorResponse(error, context = "request") {
  if (error instanceof ApiError) {
    return Response.json({ message: error.message, ...(error.details ? { details: error.details } : {}) }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
  console.error(`${context} failed`, { name: error?.name, code: error?.code });
  return Response.json({ message: "Something went wrong. Please try again." }, { status: 500, headers: { "Cache-Control": "no-store" } });
}

export function privateJson(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function readJson(request, maxBytes = 128 * 1024) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "Send the request as application/json");
  }
  const size = Number(request.headers.get("content-length"));
  if (size > maxBytes) throw new ApiError(413, "Request is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "A JSON body is required");
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, "Request is too large");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  // SameSite session cookies already protect requests without Origin. Reject
  // explicit cross-origin browser mutations, including same-site subdomains.
  if (origin && origin !== new URL(process.env.BETTER_AUTH_URL || request.url).origin) {
    throw new ApiError(403, "Cross-origin request is not allowed");
  }
}
