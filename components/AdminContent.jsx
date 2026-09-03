"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, RefreshCw, ShieldCheck } from "lucide-react";
import DataTable from "./DataTable";

export default function AdminContent() {
  const [applicants, setApplicants] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeRequest = useRef(null);

  const loadBatch = useCallback(async (nextCursor = null) => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (nextCursor) params.set("cursor", nextCursor);
      const response = await fetch(`/api/admin/applicants?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message ||
            result.error ||
            "Could not load applications. Please try again.",
        );
      if (controller.signal.aborted) return;
      setApplicants((previous) => {
        const merged = new Map(
          (nextCursor ? previous : []).map((item) => [
            item.id || item._id,
            item,
          ]),
        );
        result.applicants.forEach((item) =>
          merged.set(item.id || item._id, item),
        );
        return [...merged.values()];
      });
      setCursor(result.nextCursor || null);
      setHasMore(Boolean(result.hasMore));
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      // An aborted request must not unlock or overwrite a newer request.
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadBatch();
    return () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [loadBatch]);

  return (
    <section className="page-shell py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">GDG / recruitment workspace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Find the next builders.
          </h1>
          <p className="mt-4 max-w-xl text-[#a7aa9e]">
            A focused space to review ideas, recognise potential, and build your
            next team.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[#30332c] px-4 py-2 text-xs text-[#d7fa70]">
          <ShieldCheck size={15} /> Admin workspace
        </span>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-400/5 p-4"
        >
          <p>{error}</p>
          <button
            className="button-secondary"
            onClick={() => loadBatch(cursor)}
            disabled={loading}
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}
      {loading && !applicants.length ? (
        <div role="status" className="panel p-12 text-center text-[#a7aa9e]">
          Loading applications…
        </div>
      ) : (
        <DataTable
          data={applicants}
          setData={setApplicants}
          hasMore={hasMore}
        />
      )}
      {hasMore && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => loadBatch(cursor)}
            disabled={loading}
            className="button-secondary"
          >
            <ArrowDown size={16} />
            {loading ? "Loading…" : "Load next 50 applications"}
          </button>
          <p className="text-xs text-[#a7aa9e]">
            Filters and export apply to loaded applications.
          </p>
        </div>
      )}
    </section>
  );
}
