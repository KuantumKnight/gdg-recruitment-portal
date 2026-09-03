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
      <span className="text-xs text-[#a7aa9e]">
        {pages ? `Page ${pageIndex + 1} of ${pages}` : "0 applications"}
      </span>
      <button
        type="button"
        className="button-secondary"
        disabled={!canPrev}
        onClick={previousPage}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className="button-secondary"
        disabled={!canNext}
        onClick={nextPage}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
