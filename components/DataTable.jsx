"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Search,
  Users,
  CheckCircle2,
  ListFilter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  applicantId,
  applicantsToCsv,
  departmentLabel,
} from "@/lib/admin-utils";
import DialogComp from "./DialogComp";
import MailComposer from "./MailComposer";
import PaginationComp from "./PaginationComp";
import FilterDepartment from "./FilterDepartment";
import FilterShortlisted from "./FilterShortlisted";

const fieldClass =
  "h-11 w-full rounded-lg border border-[#30332c] bg-[#181a16] px-3 text-sm text-[#f3f1e9] focus:outline-none focus:ring-2 focus:ring-[#d7fa70]";

export default function DataTable({ data, setData, hasMore }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState({ key: "Name", direction: 1 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(new Set());
  const [pending, setPending] = useState(new Set());
  const pendingRef = useRef(new Set());
  const [reviewId, setReviewId] = useState(null);
  const departments = useMemo(
    () =>
      [...new Set(data.map((item) => item.Department).filter(Boolean))].sort(
        (a, b) => departmentLabel(a).localeCompare(departmentLabel(b)),
      ),
    [data],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data
      .filter(
        (item) =>
          (!department || item.Department === department) &&
          (!status || String(Boolean(item.shortlisted)) === status) &&
          (!term ||
            [
              item.Name,
              item.Email,
              item.RegistrationNumber,
              item.Phone,
              departmentLabel(item.Department),
            ].some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(term),
            )),
      )
      .sort(
        (a, b) =>
          String(
            sort.key === "Department"
              ? departmentLabel(a.Department)
              : (a[sort.key] ?? ""),
          ).localeCompare(
            String(
              sort.key === "Department"
                ? departmentLabel(b.Department)
                : (b[sort.key] ?? ""),
            ),
            undefined,
            { numeric: true, sensitivity: "base" },
          ) * sort.direction,
      );
  }, [data, query, department, status, sort]);
  const pageCount = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const page = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const selectedApplicants = data.filter((item) =>
    selected.has(applicantId(item)),
  );
  const reviewed = data.find((item) => applicantId(item) === reviewId);
  const allPageSelected =
    page.length > 0 && page.every((item) => selected.has(applicantId(item)));

  function updateFilter(setter, value) {
    setter(value);
    setPageIndex(0);
  }
  function toggleSelected(id) {
    setSelected((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function togglePage() {
    setSelected((previous) => {
      const next = new Set(previous);
      page.forEach((item) =>
        allPageSelected
          ? next.delete(applicantId(item))
          : next.add(applicantId(item)),
      );
      return next;
    });
  }
  async function handleShortlist(applicant) {
    const id = applicantId(applicant);
    if (pendingRef.current.has(id)) return;
    pendingRef.current.add(id);
    setPending(new Set(pendingRef.current));
    try {
      const response = await fetch(`/api/shortlist/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: !applicant.shortlisted }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message ||
            result.error ||
            "Could not update status. Please try again.",
        );
      setData((previous) =>
        previous.map((item) =>
          applicantId(item) === id
            ? { ...item, shortlisted: !applicant.shortlisted }
            : item,
        ),
      );
      toast.success(
        applicant.shortlisted
          ? "Applicant moved to pending review."
          : "Applicant shortlisted.",
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      pendingRef.current.delete(id);
      setPending(new Set(pendingRef.current));
    }
  }
  function exportCsv() {
    const records = selectedApplicants.length ? selectedApplicants : filtered;
    const url = URL.createObjectURL(
      new Blob([applicantsToCsv(records)], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `gdg-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function sendMail(payloadData) {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: selectedApplicants.map((item) => ({
          id: applicantId(item),
        })),
        payloadData,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      const progress = Array.isArray(result.acceptedIds)
        ? `${result.acceptedIds.length} accepted, ${result.unattemptedIds?.length || 0} not attempted. `
        : "";
      throw new Error(progress + (result.message || result.error || "Email could not be sent."));
    }
    toast.success(result.message || "Email sent successfully.");
  }
  const stats = [
    { label: "Applications loaded", value: data.length, Icon: Users },
    {
      label: "Shortlisted in loaded batch",
      value: data.filter((item) => item.shortlisted).length,
      Icon: CheckCircle2,
    },
    {
      label: "Matching your filters",
      value: filtered.length,
      Icon: ListFilter,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="panel flex items-start justify-between p-6"
          >
            <div>
              <p className="text-xs text-[#a7aa9e]">{label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">
                {value.toString().padStart(2, "0")}
              </p>
            </div>
            <Icon size={20} className="text-[#d7fa70]" />
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="border-b border-[#30332c] p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Application inbox</h2>
              <p className="mt-1 text-xs text-[#a7aa9e]">
                {hasMore
                  ? "More records available below. Search and export cover loaded records."
                  : "Review responses, shortlist candidates, and keep your team moving."}
              </p>
            </div>
            <button
              disabled={!filtered.length && !selectedApplicants.length}
              className="button-secondary"
              onClick={exportCsv}
            >
              <Download size={15} /> Export{" "}
              {selectedApplicants.length ? "selected" : "filtered"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
            <label className="relative">
              <span className="sr-only">Search applications</span>
              <Search
                className="absolute left-3 top-3.5 text-[#a7aa9e]"
                size={16}
              />
              <input
                value={query}
                onChange={(event) => updateFilter(setQuery, event.target.value)}
                placeholder="Search name, email, registration…"
                className={`${fieldClass} pl-10`}
              />
            </label>
            <FilterDepartment
              value={department}
              departments={departments}
              filterFunc={(value) => updateFilter(setDepartment, value)}
            />
            <FilterShortlisted
              value={status}
              filterFunc={(value) => updateFilter(setStatus, value)}
            />
            <button
              className="button-secondary"
              disabled={!query && !department && !status}
              onClick={() => {
                setQuery("");
                setDepartment("");
                setStatus("");
                setPageIndex(0);
              }}
            >
              Reset filters
            </button>
          </div>
        </div>
        {selectedApplicants.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#30332c] bg-[#d7fa70]/5 px-6 py-3">
            <span className="mr-auto text-sm">
              {selectedApplicants.length} selected across loaded records
            </span>
            <MailComposer
              recipients={selectedApplicants}
              handleRowSelection={sendMail}
            />
            <button
              className="button-secondary"
              onClick={() => setSelected(new Set())}
            >
              <X size={14} /> Clear selection
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <caption className="sr-only">
              GDG recruitment applications. Use the name button to review
              responses.
            </caption>
            <thead className="bg-[#181a16] text-xs text-[#a7aa9e]">
              <tr>
                <th scope="col" className="w-12 p-4">
                  <input
                    type="checkbox"
                    aria-label="Select all applications on this page"
                    ref={(element) => {
                      if (element)
                        element.indeterminate =
                          !allPageSelected &&
                          page.some((item) => selected.has(applicantId(item)));
                    }}
                    checked={allPageSelected}
                    disabled={!page.length}
                    onChange={togglePage}
                    className="h-4 w-4 accent-[#d7fa70]"
                  />
                </th>
                {[
                  ["Name", "Applicant"],
                  ["Department", "Department"],
                  ["Pref", "Preference"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      sort.key === key
                        ? sort.direction === 1
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="px-4 py-4"
                  >
                    <button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setSort({
                          key,
                          direction: sort.key === key ? -sort.direction : 1,
                        });
                        setPageIndex(0);
                      }}
                    >
                      {label}
                      {sort.key === key &&
                        (sort.direction === 1 ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                ))}
                <th scope="col" className="px-4 py-4">
                  Status
                </th>
                <th scope="col" className="px-4 py-4">
                  <span className="sr-only">Review application</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {page.map((applicant) => {
                const id = applicantId(applicant);
                return (
                  <tr
                    key={id}
                    className="border-t border-[#30332c] transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${applicant.Name}`}
                        checked={selected.has(id)}
                        onChange={() => toggleSelected(id)}
                        className="h-4 w-4 accent-[#d7fa70]"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <button
                        className="text-left font-medium hover:text-[#d7fa70]"
                        onClick={() => setReviewId(id)}
                      >
                        {applicant.Name || "Unnamed applicant"}
                      </button>
                      <p className="mt-1 text-xs text-[#a7aa9e]">
                        {applicant.Email}
                      </p>
                      <p className="mt-1 text-xs text-[#a7aa9e]">
                        {applicant.RegistrationNumber}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      {departmentLabel(applicant.Department)}
                    </td>
                    <td className="px-4 py-5 text-[#a7aa9e]">
                      {applicant.Pref || "—"}
                    </td>
                    <td className="px-4 py-5">
                      <button
                        aria-pressed={Boolean(applicant.shortlisted)}
                        aria-label={`${applicant.shortlisted ? "Remove" : "Add"} ${applicant.Name} ${applicant.shortlisted ? "from" : "to"} shortlist`}
                        disabled={pending.has(id)}
                        onClick={() => handleShortlist(applicant)}
                        className={`rounded-full border px-3 py-2 text-xs ${applicant.shortlisted ? "border-[#d7fa70]/30 bg-[#d7fa70]/10 text-[#d7fa70]" : "border-[#41463a] text-[#c4c7bb]"}`}
                      >
                        {pending.has(id)
                          ? "Saving…"
                          : applicant.shortlisted
                            ? "Shortlisted ✓"
                            : "Pending review"}
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <button
                        onClick={() => setReviewId(id)}
                        className="text-xs text-[#d7fa70] hover:underline"
                        aria-label={`Review ${applicant.Name}'s responses`}
                      >
                        Review ↗
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto mb-4 text-[#717867]" size={30} />
            <h3 className="font-medium">
              {data.length
                ? "No matching applications"
                : "A new team starts here"}
            </h3>
            <p className="mt-2 text-sm text-[#a7aa9e]">
              {data.length
                ? "Try another search or reset your filters."
                : "Applications will appear here once students submit their responses."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#30332c] p-4">
          <label className="flex items-center gap-2 text-xs text-[#a7aa9e]">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageIndex(0);
              }}
              className="rounded-md border border-[#30332c] bg-[#181a16] p-2"
            >
              {[10, 25, 50].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>
          <PaginationComp
            pageIndex={currentPage}
            pages={pageCount}
            nextPage={() => setPageIndex(currentPage + 1)}
            previousPage={() => setPageIndex(currentPage - 1)}
            canNext={currentPage + 1 < pageCount}
            canPrev={currentPage > 0}
          />
        </div>
      </div>
      <DialogComp
        applicant={reviewed}
        open={Boolean(reviewed)}
        onOpenChange={(open) => {
          if (!open) setReviewId(null);
        }}
        onShortlist={handleShortlist}
        pending={reviewed ? pending.has(applicantId(reviewed)) : false}
      />
    </div>
  );
}


