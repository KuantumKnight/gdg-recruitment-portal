"use client";

export default function FilterShortlisted({ value = "", filterFunc }) {
  return (
    <label className="block">
      <span className="sr-only">Filter by shortlist status</span>
      <select
        value={value}
        onChange={(event) => filterFunc(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#dadce0] bg-white px-3 text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
      >
        <option value="">All statuses</option>
        <option value="false">Pending review</option>
        <option value="true">Shortlisted</option>
      </select>
    </label>
  );
}
