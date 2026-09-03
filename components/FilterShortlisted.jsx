"use client";

export default function FilterShortlisted({ value = "", filterFunc }) {
  return (
    <label className="block">
      <span className="sr-only">Filter by shortlist status</span>
      <select
        value={value}
        onChange={(event) => filterFunc(event.target.value)}
        className="h-11 w-full rounded-lg border border-[#30332c] bg-[#181a16] px-3 text-sm text-[#f3f1e9] focus:outline-none focus:ring-2 focus:ring-[#d7fa70]"
      >
        <option value="">All statuses</option>
        <option value="false">Pending review</option>
        <option value="true">Shortlisted</option>
      </select>
    </label>
  );
}
