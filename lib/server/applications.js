import { createHash } from "node:crypto";
import { ApiError } from "./api-error";
import { registrationIdentityKey } from "../application-identity";
import { MAX_APPLICATIONS } from "../recruitment";

export const identityKey = (email) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
export const documentData = (doc) => {
  const data = doc.data();
  const legacy = !data.Department && typeof data.Questions?.Department === "string";
  if (!legacy) return { ...data, id: doc.id, _id: doc.id };
  const { Department, Gender, "Year of Study": year, Questions, ...answers } = data.Questions;
  return {
    ...data, Department,
    Gender: data.Gender ?? Gender ?? "",
    "Year of Study": data["Year of Study"] ?? year ?? "",
    Questions: Questions && typeof Questions === "object" ? Questions : answers,
    id: doc.id, _id: doc.id,
  };
};

// Every writer for an applicant contends on the normalized registration-number index.
export async function saveApplication(db, user, data) {
  const email = user.email.trim().toLowerCase();
  const registrationNumber = String(data.RegistrationNumber).trim().toUpperCase();
  const collection = db.collection("formData");
  const indexRef = db.collection("applicationIndexes").doc(registrationIdentityKey(registrationNumber));
  return db.runTransaction(async (transaction) => {
    const index = await transaction.get(indexRef);
    let entries = index.exists ? index.data().entries || [] : null;
    if (!entries) {
      const legacy = await transaction.get(collection.where("RegistrationNumber", "==", registrationNumber));
      const docs = new Map(legacy.docs.map((doc) => [doc.id, doc]));
      entries = [...docs.values()].map((doc) => ({ id: doc.id, department: doc.data().Department || doc.data().Questions?.Department || null }));
    }
    const existing = entries.find((entry) => entry.department === data.Department);
    if (existing) return { id: existing.id, duplicate: true };
    if (entries.length >= MAX_APPLICATIONS) throw new ApiError(409, "You can submit applications to at most two departments.");
    const ref = collection.doc();
    const record = {
      schemaVersion: 2, Name: data.Name, Email: email,
      RegistrationNumber: registrationNumber, Phone: data.Phone,
      Gender: data.Gender || "", "Year of Study": data["Year of Study"] || "",
      Department: data.Department, Questions: data.Questions,
      Pref: String(entries.length + 1), shortlisted: false, createdAt: new Date(),
    };
    transaction.create(ref, record);
    transaction.set(indexRef, { registrationNumber, entries: [...entries, { id: ref.id, department: data.Department }], updatedAt: new Date() });
    return { id: ref.id, duplicate: false };
  });
}

export async function ownApplications(db, user) {
  const email = user.email.trim().toLowerCase();
  const collection = db.collection("formData");
  const snapshot = await collection.where("Email", "==", email).limit(100).get();
  const original = email !== user.email ? await collection.where("Email", "==", user.email).limit(100).get() : null;
  return [...new Map([...snapshot.docs, ...(original?.docs || [])].map((doc) => [doc.id, documentData(doc)])).values()];
}
