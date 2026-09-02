import { describe, it, expect } from "vitest";
import { departments } from "../lib/catalog";
import { buildSubmissionPayload, createApplicationSchema, MOTIVATION_QUESTION } from "../lib/validation/application";
import { identityKey, saveApplication } from "../lib/server/applications";
import { isRecruitmentOpen } from "../lib/recruitment";
import { ApiError, readJson } from "../lib/server/api-error";
const department = departments[0];
const values = { Name: "Test Applicant", RegistrationNumber: "25bce5612", Phone: "98765 43210", Gender: "Female", "Year of Study": "2", motivation: "To learn and build with the community.", answers: Object.fromEntries(department.questions.map((q) => [`${department.id}:${q.id}`, `Answer for ${q.id}`])) };
const payload = () => buildSubmissionPayload(department, values, 1);

// Minimal transaction contract fake: commits are serialized and writes staged
// until callback succeeds. This verifies application invariants without a DB.
function database(seed = []) {
  const records = new Map(seed.map((data, i) => [`formData/legacy${i}`, data]));
  let counter = 0, queue = Promise.resolve();
  const collection = (name) => ({
    doc: (id = `new${++counter}`) => ({ path: `${name}/${id}`, id }),
    where: (field, op, value) => ({ collection: name, field, value }),
  });
  const db = { records, collection, runTransaction: (callback) => {
    const run = queue.then(async () => {
      const writes = [];
      const transaction = {
        get: async (ref) => ref.path ? { exists: records.has(ref.path), data: () => records.get(ref.path) } : { docs: [...records].filter(([key, value]) => key.startsWith(`${ref.collection}/`) && value[ref.field] === ref.value).map(([key, value]) => ({ id: key.split('/')[1], data: () => value })) },
        create: (ref, data) => writes.push(() => { if (records.has(ref.path)) throw new Error('Duplicate document'); records.set(ref.path, data); }),
        set: (ref, data) => writes.push(() => records.set(ref.path, data)),
      };
      const result = await callback(transaction);
      writes.forEach((write) => write());
      return result;
    });
    queue = run.catch(() => {});
    return run;
  } };
  return db;
}
const user = { id: "user-1", email: "Applicant@example.com" };
describe("response persistence", () => {
  it("preserves gender, motivation and every punctuation-bearing question key", () => {
    const parsed = createApplicationSchema(department).parse(payload());
    expect(parsed.Gender).toBe("Female");
    expect(parsed.RegistrationNumber).toBe("25BCE5612");
    expect(parsed.Phone).toBe("9876543210");
    expect(parsed.Questions[MOTIVATION_QUESTION]).toBe(values.motivation);
    department.questions.forEach((q) => expect(parsed.Questions[q.name]).toBe(`Answer for ${q.id}`));
  });
  it("rejects missing required responses and undeclared fields", () => {
    const data = payload(); delete data.Questions[department.questions[0].name];
    expect(createApplicationSchema(department).safeParse(data).success).toBe(false);
    expect(createApplicationSchema(department).safeParse({ ...payload(), shortlisted: true }).success).toBe(false);
  });
  it("persists full response and takes identity/rank from the server", async () => {
    const db = database();
    const data = createApplicationSchema(department).parse(payload());
    const result = await saveApplication(db, user, { ...data, Email: 'ignored@example.com', Pref: '2' });
    expect(db.records.get(`formData/${result.id}`)).toMatchObject({ Email: 'applicant@example.com', Pref: '1', Gender: 'Female', Questions: data.Questions, shortlisted: false, schemaVersion: 2 });
  });
  it("a retry returns the original ID without overwriting answers", async () => {
    const db = database(); const data = payload();
    const first = await saveApplication(db, user, data);
    const second = await saveApplication(db, user, { ...data, Questions: { changed: 'new' } });
    expect(second).toEqual({ id: first.id, duplicate: true });
    expect(db.records.get(`formData/${first.id}`).Questions).toEqual(data.Questions);
  });
  it("limits simultaneous requests to two departments", async () => {
    const db = database();
    const results = await Promise.allSettled(['one', 'two', 'three'].map((Department) => saveApplication(db, user, { ...payload(), Department })));
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
    expect(results.find((result) => result.status === 'rejected').reason.status).toBe(409);
    expect([...db.records.keys()].filter((key) => key.startsWith('formData/'))).toHaveLength(2);
  });
  it("counts legacy documents when initializing the applicant index", async () => {
    const db = database([{ Email: user.email, Department: 'legacy-one' }, { Email: user.email, Department: 'legacy-two' }]);
    await expect(saveApplication(db, user, payload())).rejects.toMatchObject({ status: 409 });
  });
  it("normalizes applicant index identity", () => expect(identityKey(' Applicant@Example.com ')).toBe(identityKey('applicant@example.com')));
});
describe('request constraints', () => {
  it('uses one inclusive deadline boundary and fails closed for bad config', () => {
    expect(isRecruitmentOpen('2026-09-08T00:00:00Z', '2026-09-08T00:00:00Z')).toBe(true);
    expect(isRecruitmentOpen('2026-09-08T00:00:01Z', '2026-09-08T00:00:00Z')).toBe(false);
    expect(isRecruitmentOpen(new Date(), 'invalid')).toBe(false);
  });
  it('rejects invalid JSON with a controlled error', async () => {
    await expect(readJson(new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).rejects.toBeInstanceOf(ApiError);
  });
  it('enforces actual body size even without Content-Length', async () => {
    await expect(readJson(new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: 'oversized' }) }), 5)).rejects.toMatchObject({ status: 413 });
  });
});
