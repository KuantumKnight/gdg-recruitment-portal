import { describe, it, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), requireUser: vi.fn(), connect: vi.fn() }));
vi.mock("@/lib/server/authorization", () => ({ requireAdmin: mocks.requireAdmin, requireUser: mocks.requireUser, assertOwnEmail: vi.fn() }));
vi.mock("@/lib/db", () => ({ connect: mocks.connect, serializeFirestoreData: (data) => data }));
import { GET as listApplicants } from "../app/api/admin/applicants/route";
import { PATCH as shortlist } from "../app/api/shortlist/[id]/route";
import { ApiError } from "../lib/server/api-error";
beforeEach(() => { vi.resetAllMocks(); });
describe("privileged route boundaries", () => {
  it.each([401, 403])("listing rejects role/session failure %s before database access", async (status) => {
    mocks.requireAdmin.mockRejectedValue(new ApiError(status, "Access denied"));
    const response = await listApplicants(new Request("http://localhost/api/admin/applicants"));
    expect(response.status).toBe(status);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it.each([401, 403])("shortlisting rejects role/session failure %s before database access", async (status) => {
    mocks.requireAdmin.mockRejectedValue(new ApiError(status, "Access denied"));
    const response = await shortlist(new Request("http://localhost/api/shortlist/test", { method: "PATCH" }), { params: Promise.resolve({ id: "test" }) });
    expect(response.status).toBe(status);
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("rejects an unbounded page size before opening the database", async () => {
    mocks.requireAdmin.mockResolvedValue({ role: "admin" });
    const response = await listApplicants(new Request("http://localhost/api/admin/applicants?limit=1000"));
    expect(response.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("rejects a non-boolean shortlist value before opening the database", async () => {
    mocks.requireAdmin.mockResolvedValue({ role: "admin" });
    const response = await shortlist(new Request("http://localhost/api/shortlist/test", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ shortlisted: "yes" }) }), { params: Promise.resolve({ id: "test" }) });
    expect(response.status).toBe(422);
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("awaits route params and returns404 before writing an absent applicant", async () => {
    mocks.requireAdmin.mockResolvedValue({ role: "admin" });
    const update = vi.fn();
    mocks.connect.mockResolvedValue({ collection: () => ({ doc: () => ({}) }), runTransaction: async (fn) => fn({ get: async () => ({ exists: false }), update }) });
    const response = await shortlist(new Request("http://localhost/api/shortlist/test", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ shortlisted: true }) }), { params: Promise.resolve({ id: "test" }) });
    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
});
