"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationComp({
  pageIndex,
  pages,
  nextPage,
  previousPage,
  canNext,
  canPrev,
}) {
  return (
    <nav aria-label="Application pages" className="flex items-center gap-3">
      <span className="text-xs text-[#5f6368]">
        {pages ? `Page ${pageIndex + 1} of ${pages}` : "0 applications"}
      </span>
      <button
        type="button"
        className="button-secondary min-h-0 p-2.5"
        disabled={!canPrev}
        onClick={previousPage}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className="button-secondary min-h-0 p-2.5"
        disabled={!canNext}
        onClick={nextPage}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
