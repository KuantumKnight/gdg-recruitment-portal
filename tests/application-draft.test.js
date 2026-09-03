import { describe, expect, it } from "vitest";
import {
  applicationDraftKey,
  readApplicationDraft,
} from "../lib/application-draft";
describe("application draft isolation", () => {
  it("isolates users and selections while preserving reordered selections", () => {
    expect(applicationDraftKey("alice", ["b", "a"])).toBe(
      applicationDraftKey("alice", ["a", "b"]),
    );
    expect(applicationDraftKey("alice", ["a"])).not.toBe(
      applicationDraftKey("bob", ["a"]),
    );
    expect(applicationDraftKey("alice", ["a"])).not.toBe(
      applicationDraftKey("alice", ["b"]),
    );
  });
  it("rejects malformed fields and answers outside the selected departments", () => {
    const result = readApplicationDraft(
      JSON.stringify({
        values: {
          Name: 42,
          Phone: "123",
          submittedDepartments: ["forged"],
          answers: { "a:q1": "mine", "b:q1": "other", "a:q2": { bad: true } },
        },
      }),
      ["a:q1", "a:q2"],
    );
    expect(result).toEqual({ Phone: "123", answers: { "a:q1": "mine" } });
  });
  it("bounds stored text and surfaces invalid JSON for the UI recovery path", () => {
    expect(
      readApplicationDraft(
        JSON.stringify({ values: { motivation: "x".repeat(7000) } }),
        [],
      ).motivation,
    ).toHaveLength(6000);
    expect(() => readApplicationDraft("broken", [])).toThrow();
    expect(readApplicationDraft(null, [])).toBeNull();
  });
});
