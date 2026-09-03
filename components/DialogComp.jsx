"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applicantQuestions, departmentLabel } from "@/lib/admin-utils";

export default function DialogComp({
  applicant,
  open,
  onOpenChange,
  onShortlist,
  pending,
}) {
  const questions = applicantQuestions(applicant);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#30332c] bg-[#181a16] text-[#f3f1e9] sm:max-w-2xl">
        <DialogHeader>
          <p className="eyebrow mb-2">Application review</p>
          <DialogTitle className="text-2xl">
            {applicant?.Name || "Applicant"}
          </DialogTitle>
          <DialogDescription>
            {departmentLabel(applicant?.Department)} · Preference{" "}
            {applicant?.Pref || "—"}
          </DialogDescription>
        </DialogHeader>
        {applicant && (
          <>
            <dl className="grid gap-4 rounded-xl border border-[#30332c] p-4 text-sm sm:grid-cols-2">
              {[
                ["Email", applicant.Email],
                ["Registration", applicant.RegistrationNumber],
                ["Phone", applicant.Phone],
                [
                  "Status",
                  applicant.shortlisted ? "Shortlisted" : "Pending review",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-xs text-[#a7aa9e]">{label}</dt>
                  <dd className="break-words">{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-5">
              {questions.length ? (
                questions.map(([question, answer], index) => (
                  <section
                    key={`${index}-${question}`}
                    className="border-b border-[#30332c] pb-5"
                  >
                    <h3 className="text-sm font-medium">
                      <span className="mr-2 text-[#d7fa70]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {question}
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#b9bdae]">
                      {answer || "Not answered"}
                    </p>
                  </section>
                ))
              ) : (
                <p className="py-5 text-sm text-[#a7aa9e]">
                  No responses were recorded for this application.
                </p>
              )}
            </div>
            <button
              className="button-primary"
              disabled={pending}
              onClick={() => onShortlist(applicant)}
            >
              {pending
                ? "Saving…"
                : applicant.shortlisted
                  ? "Remove from shortlist"
                  : "Shortlist applicant"}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
