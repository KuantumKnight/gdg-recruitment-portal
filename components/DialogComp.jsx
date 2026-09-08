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
      <DialogContent className="rounded-none border-[#111] bg-white text-[#202124] shadow-xl sm:max-w-2xl">
        <DialogHeader>
          <p className="eyebrow mb-1">Application review</p>
          <DialogTitle className="text-2xl font-medium tracking-[-.03em] text-[#202124]">
            {applicant?.Name || "Applicant"}
          </DialogTitle>
          <DialogDescription className="text-[#5f6368]">
            {departmentLabel(applicant?.Department)} · Preference {applicant?.Pref || "—"}
          </DialogDescription>
        </DialogHeader>

        {applicant && (
          <>
            <dl className="grid gap-4 border border-[#111] bg-[#f8f9fa] p-4 text-sm sm:grid-cols-2">
              {[
                ["Email", applicant.Email],
                ["Registration", applicant.RegistrationNumber],
                ["Phone", applicant.Phone],
                ["Status", applicant.shortlisted ? "Shortlisted" : "Pending review"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-xs text-[#80868b]">{label}</dt>
                  <dd className="break-words text-[#202124]">{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>

            <div className="max-h-[50vh] space-y-5 overflow-y-auto pr-1">
              {questions.length ? (
                questions.map(([question, answer], index) => (
                  <section
                    key={`${index}-${question}`}
                    className="border-b border-[#e8eaed] pb-5"
                  >
                    <h3 className="text-sm font-medium text-[#202124]">
                      <span className="mr-2 text-[#1a73e8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {question}
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#5f6368]">
                      {answer || "Not answered"}
                    </p>
                  </section>
                ))
              ) : (
                <p className="py-5 text-sm text-[#5f6368]">
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
