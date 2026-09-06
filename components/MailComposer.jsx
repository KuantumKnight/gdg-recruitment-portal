"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { renderMailBody } from "@/lib/mail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const inputClass =
  "w-full rounded-xl border border-[#dadce0] bg-white p-3 text-sm text-[#202124] placeholder:text-[#9aa0a6] focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]";

export default function MailComposer({ recipients, handleRowSelection }) {
  const [open, setOpen] = useState(false);
  const tooManyRecipients = recipients.length > 50;
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const recipientKey = recipients
    .map((item) => item.id || item._id)
    .sort()
    .join(",");
  const [verifiedRecipients, setVerifiedRecipients] = useState("");
  const verified = preview && verifiedRecipients === recipientKey;

  async function send() {
    if (!verified || sending || tooManyRecipients) return;
    setSending(true);
    setError("");
    try {
      await handleRowSelection({
        subject: subject.trim(),
        body: body.trim(),
      });
      setOpen(false);
      setPreview(false);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(
        `${err.message} Some messages may already have been delivered. Check delivery records before retrying.`,
      );
      setPreview(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!sending) {
          setOpen(value);
          setPreview(false);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="button-secondary" disabled={!recipients.length}>
          <Mail size={15} /> Compose email
        </button>
      </DialogTrigger>

      <DialogContent className="border-[#dadce0] bg-white text-[#202124] shadow-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium text-[#202124]">Email selected applicants</DialogTitle>
          <DialogDescription className="text-[#5f6368]">
            Review your message and {recipients.length} recipient
            {recipients.length === 1 ? "" : "s"} before sending.
          </DialogDescription>
        </DialogHeader>

        <div
          className="max-h-24 overflow-y-auto rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-3 text-xs text-[#5f6368]"
          aria-label="Email recipients"
        >
          {recipients.map((item) => (
            <p key={item.id || item._id}>
              {item.Name} · {item.Email}
            </p>
          ))}
        </div>

        {tooManyRecipients && (
          <p role="alert" className="rounded-xl bg-[#fef7e0] p-3 text-sm text-[#7c4a03]">
            Select 50 or fewer applicants to send an email batch.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-[#fce8e6] p-3 text-sm text-[#a50e0e]">
            {error}
          </p>
        )}

        <label className="space-y-2 text-sm text-[#3c4043]">
          <span>Subject</span>
          <input
            value={subject}
            maxLength={200}
            disabled={sending}
            onChange={(event) => {
              setSubject(event.target.value);
              setPreview(false);
            }}
            className={inputClass}
            placeholder="Your next chapter with GDG"
          />
        </label>

        <label className="space-y-2 text-sm text-[#3c4043]">
          <span>Message</span>
          <textarea
            value={body}
            maxLength={3000}
            rows={8}
            disabled={sending}
            onChange={(event) => {
              setBody(event.target.value);
              setPreview(false);
            }}
            className={inputClass}
            placeholder="Write your message…"
          />
        </label>

        <p className="text-xs text-[#80868b]">
          Use #name and #dept to personalise each email. Plain text and line breaks are preserved. {body.length.toLocaleString()} / 3,000 characters.
        </p>

        {verified && (
          <div className="rounded-2xl border border-[#d2e3fc] bg-[#e8f0fe] p-4">
            <p className="mb-2 text-xs font-medium text-[#1a73e8]">
              Preview for {recipients[0]?.Name}
            </p>
            <p className="font-medium text-[#202124]">{subject}</p>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#3c4043]">
              {renderMailBody(body, recipients[0] || {}).text}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            className="button-secondary"
            disabled={sending || tooManyRecipients || !subject.trim() || !body.trim()}
            onClick={() => {
              setPreview(true);
              setVerifiedRecipients(recipientKey);
            }}
          >
            Review message
          </button>
          <button
            className="button-primary"
            disabled={!verified || sending || tooManyRecipients || !recipients.length}
            onClick={send}
          >
            {sending
              ? "Sending…"
              : `Send to ${recipients.length} applicant${recipients.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
