import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(), connect: vi.fn(), getAll: vi.fn(),
  sendMail: vi.fn(), close: vi.fn(), createTransport: vi.fn(),
}));
vi.mock("@/lib/server/authorization", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/db", () => ({ connect: mocks.connect }));
vi.mock("nodemailer", () => ({ default: { createTransport: mocks.createTransport } }));
import { POST } from "../app/api/send-email/route";
import { ApiError } from "../lib/server/api-error";
import { renderMailBody } from "../lib/mail";
import { departments } from "../lib/catalog";

const snapshot = (id, data = {}) => ({ id, exists: true, data: () => ({
  Name: "Alex & team", Email: `${id}@example.test`, Department: departments[0].name, ...data,
}) });
const body = (ids = ["first"]) => ({ recipients: ids.map((id) => ({ id })),
  payloadData: { subject: "GDG update", body: "Hello #name,\nWelcome to #dept." } });
const request = (data = body(), origin = "http://localhost") => new Request("http://localhost/api/send-email", {
  method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(data),
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("EMAIL_USERNAME", "sender@example.test");
  vi.stubEnv("EMAIL_PASSWORD", "mock-provider-password");
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost");
  mocks.requireAdmin.mockResolvedValue({ id: "admin", role: "admin" });
  mocks.getAll.mockResolvedValue([snapshot("first")]);
  mocks.connect.mockResolvedValue({ collection: () => ({ doc: (id) => ({ id }) }), getAll: mocks.getAll });
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail, close: mocks.close });
  mocks.sendMail.mockResolvedValue({ accepted: ["first@example.test"] });
});
afterEach(() => vi.unstubAllEnvs());

describe("admin email contract", () => {
  it.each([401, 403])("denies status %s before DB or SMTP setup", async (status) => {
    mocks.requireAdmin.mockRejectedValue(new ApiError(status, "Access denied"));
    const response = await POST(request());
    expect(response.status).toBe(status);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
  it("rejects explicit cross-origin requests before side effects", async () => {
    expect((await POST(request(body(), "https://other.example.test"))).status).toBe(403);
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it.each([
    null,
    body([]),
    body(["same", "same"]),
    body(Array.from({ length: 51 }, (_, index) => `app${index}`)),
    { ...body(), recipients: [{ id: "first", Email: "extra@example.test" }] },
    { ...body(), payloadData: { subject: "Two\nlines", body: "Message" } },
    { ...body(), payloadData: { subject: "Update", body: "x".repeat(3001) } },
  ])("rejects malformed or out-of-contract input", async (data) => {
    expect((await POST(request(data))).status).toBe(422);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
  it("reports missing configuration without contacting DB or SMTP", async () => {
    vi.stubEnv("EMAIL_PASSWORD", "");
    expect((await POST(request())).status).toBe(503);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
  it("validates all recipients before any send when a later document is missing", async () => {
    mocks.getAll.mockResolvedValue([snapshot("first"), { id: "second", exists: false }]);
    expect((await POST(request(body(["first", "second"])))).status).toBe(404);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
  it("rejects invalid stored email addresses before SMTP setup", async () => {
    mocks.getAll.mockResolvedValue([snapshot("first", { Email: "invalid" })]);
    expect((await POST(request())).status).toBe(422);
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
  it("resolves addresses from DB and escapes personalized HTML on the server", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getAll).toHaveBeenCalledWith({ id: "first" });
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "first@example.test", from: "sender@example.test", subject: "GDG update",
      text: `Hello Alex & team,\nWelcome to ${departments[0].displayName}.`,
      html: `<p>Hello Alex &amp; team,<br>Welcome to ${departments[0].displayName}.</p>`,
      disableFileAccess: true, disableUrlAccess: true,
    }));
    expect((await response.json()).acceptedIds).toEqual(["first"]);
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it("stops after uncertain SMTP failure and reports accepted and unattempted IDs", async () => {
    mocks.getAll.mockResolvedValue(["first", "second", "third"].map((id) => snapshot(id)));
    mocks.sendMail.mockResolvedValueOnce({ accepted: ["first@example.test"] }).mockRejectedValueOnce(new Error("private provider failure"));
    const response = await POST(request(body(["first", "second", "third"])));
    const result = await response.json();
    expect(response.status).toBe(502);
    expect(result).toMatchObject({ acceptedIds: ["first"], uncertainId: "second", unattemptedIds: ["third"] });
    expect(JSON.stringify(result)).not.toContain("private provider failure");
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it("does not report success when SMTP resolves without accepting the recipient", async () => {
    mocks.sendMail.mockResolvedValue({ accepted: [], rejected: ["first@example.test"] });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect((await response.json()).acceptedIds).toEqual([]);
  });
  it("preserves literal HTML and does not recursively expand placeholders in names", () => {
    const result = renderMailBody("<em>#name</em> / #dept", { Name: "A #dept", Department: "unknown" });
    expect(result.text).toBe("<em>A #dept</em> / GDG on Campus");
    expect(result.html).toBe("<p>&lt;em&gt;A #dept&lt;/em&gt; / GDG on Campus</p>");
  });
});

