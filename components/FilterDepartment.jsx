"use client";
import { departmentLabel } from "@/lib/admin-utils";

export default function FilterDepartment({
  value = "",
  departments = [],
  filterFunc,
}) {
  return (
    <label className="block">
      <span className="sr-only">Filter by department</span>
      <select
        value={value}
        onChange={(event) => filterFunc(event.target.value)}
        className="h-11 w-full rounded-lg border border-[#30332c] bg-[#181a16] px-3 text-sm text-[#f3f1e9] focus:outline-none focus:ring-2 focus:ring-[#d7fa70]"
      >
        <option value="">All departments</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {departmentLabel(department)}
          </option>
        ))}
      </select>
    </label>
  );
}
