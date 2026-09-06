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
        className="h-11 w-full rounded-xl border border-[#dadce0] bg-white px-3 text-sm text-[#202124] focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
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
