# Frontend improvements

The application now uses stable department UUID + question ID keys in the browser. Only the shared payload builder translates these into original stored question names. This prevents react-hook-form from interpreting punctuation and dots in question text as nested paths, and keeps identical prompts in different departments separate. The catalog keeps every legacy department name and question key. Readable labels are newly authored replacements, not a claim to recover the original corrupted copy.

The form uses the same schema as the server, including gender, year, motivation, required questions and bounded input lengths. Validation focuses the first invalid field and exposes errors to assistive technology. Requests are serialized; successful departments are marked immediately, and retry sends only pending applications. A single submissions provider owns status loading and errors across the UI. Status failures block submission rather than interpreting a failed request as an empty account.

Local drafts are versioned and isolated by authenticated user plus sorted department IDs. Storage reads/writes fail safely when blocked, and a remove-saved-copy action supports shared devices. Drafts never establish authoritative submission state. Browser draft content is unencrypted local device data, so production privacy policy should describe retention.

Recruitment routes validate one or two unique catalog UUIDs on the server and await Next 15 params. The original expired recruitment date remains unchanged and is configurable through NEXT_PUBLIC_RECRUITMENT_DEADLINE; the engineering evaluation deadline does not reopen recruitment. The closed state is honest and keeps exploration available.

The department browser has responsive CSS layouts, native keyboard-accessible checkbox cards, category filters, search and a sticky selection summary. Busy loops, random keys, resize telemetry and effect chains were removed from the rewritten components. Reduced-motion preferences disable card movement. No external image or font requests are introduced by these components.

Verification: 3 draft isolation/recovery tests pass in Vitest; all rewritten frontend components pass Next core-web-vitals ESLint rules using an explicit temporary configuration (removed after verification). Integration build and browser verification are tracked in the overall project audit.
