import { describe, it, expect } from "vitest";
import { documentData } from "../lib/server/applications";

describe("legacy response reads", () => {
  const doc = (data) => ({ id: "real-id", data: () => data });
  it("lifts the old action's nested metadata and answer map without rewriting the source", () => {
    const stored = { Name: "Alex", Questions: {
      Department: "Management", Gender: "Female", "Year of Study": "2",
      Questions: { "Why join?": "To build", "Experience": "Learning" },
    } };
    const result = documentData(doc(stored));
    expect(result).toMatchObject({ id: "real-id", Department: "Management", Gender: "Female",
      "Year of Study": "2", Questions: { "Why join?": "To build", Experience: "Learning" } });
    expect(stored.Department).toBeUndefined();
    expect(stored.Questions.Department).toBe("Management");
  });
  it("keeps top-level answers in the historical rest-object format", () => {
    expect(documentData(doc({ Questions: { Department: "Design", "Why join?": "To learn" } })))
      .toMatchObject({ Department: "Design", Questions: { "Why join?": "To learn" } });
  });
  it("does not reinterpret a current response and takes ID from Firestore", () => {
    const answers = { Department: "This is an answer", "Why join?": "To build" };
    expect(documentData(doc({ Department: "Web Dev", Questions: answers, id: "stored-id" })))
      .toEqual({ Department: "Web Dev", Questions: answers, id: "real-id", _id: "real-id" });
  });
});

