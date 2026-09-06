import { createHash } from "node:crypto";
import { ApiError } from "./api-error";
import { registrationIdentityKey } from "../application-identity";
import { MAX_APPLICATIONS } from "../recruitment";

export const identityKey = (email) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

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

async function resolveRegistrationState(transaction, collection, index, registrationNumber, email) {
  const indexData = index.exists ? index.data() || {} : {};
  let entries = Array.isArray(indexData.entries) ? indexData.entries : null;
  let ownerEmail = normalizeEmail(indexData.ownerEmail);

  if (ownerEmail && ownerEmail !== email) {
    throw new ApiError(409, "This registration number is already linked to another applicant account.");
  }

  if (!entries || !ownerEmail) {
    const legacy = await transaction.get(collection.where("RegistrationNumber", "==", registrationNumber));
    const docs = legacy.docs || [];

    if (!entries) {
      entries = docs.map((doc) => ({
        id: doc.id,
        department: doc.data().Department || doc.data().Questions?.Department || null,
      }));
    }

    if (!ownerEmail) {
      const owners = [...new Set(docs.map((doc) => normalizeEmail(doc.data().Email)).filter(Boolean))];
      if (owners.length > 1) {
        throw new ApiError(409, "Existing applications for this registration number need administrator review.");
      }
      ownerEmail = owners[0] || email;
    }
  }

  if (ownerEmail !== email) {
    throw new ApiError(409, "This registration number is already linked to another applicant account.");
  }

  return { entries, ownerEmail };
}

// Every writer for an applicant contends on the normalized registration-number index.
export async function saveApplication(db, user, data) {
  const email = normalizeEmail(user.email);
  const registrationNumber = String(data.RegistrationNumber).trim().toUpperCase();
  const collection = db.collection("formData");
  const indexRef = db.collection("applicationIndexes").doc(registrationIdentityKey(registrationNumber));
  return db.runTransaction(async (transaction) => {
    const index = await transaction.get(indexRef);
    const { entries, ownerEmail } = await resolveRegistrationState(transaction, collection, index, registrationNumber, email);
    const existing = entries.find((entry) => entry.department === data.Department);
    if (existing) return { id: existing.id, duplicate: true };
    if (entries.length >= MAX_APPLICATIONS) throw new ApiError(409, "You can submit applications to at most two departments.");
    const ref = collection.doc();
    const record = {
      schemaVersion: 3, userId: user.id, Name: data.Name, Email: email,
      RegistrationNumber: registrationNumber, Phone: data.Phone,
      Gender: data.Gender || "", "Year of Study": data["Year of Study"] || "",
      Department: data.Department, Questions: data.Questions,
      Pref: String(entries.length + 1), shortlisted: false, createdAt: new Date(),
    };
    transaction.create(ref, record);
    transaction.set(indexRef, {
      registrationNumber,
      ownerEmail,
      ownerUserId: user.id,
      entries: [...entries, { id: ref.id, department: data.Department }],
      updatedAt: new Date(),
    });
    return { id: ref.id, duplicate: false };
  });
}

export async function ownApplications(db, user) {
  const email = normalizeEmail(user.email);
  const collection = db.collection("formData");
  const snapshot = await collection.where("Email", "==", email).limit(100).get();
  const original = email !== user.email ? await collection.where("Email", "==", user.email).limit(100).get() : null;
  return [...new Map([...snapshot.docs, ...(original?.docs || [])].map((doc) => [doc.id, documentData(doc)])).values()];
}
