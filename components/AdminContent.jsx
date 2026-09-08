"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownward } from "@material-symbols-svg/react/icons/arrow-downward";
import { Refresh } from "@material-symbols-svg/react/icons/refresh";
import { VerifiedUser } from "@material-symbols-svg/react/icons/verified-user";
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
      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not load applications. Please try again.",
        );
      }
      if (controller.signal.aborted) return;
      setApplicants((previous) => {
        const merged = new Map(
          (nextCursor ? previous : []).map((item) => [item.id || item._id, item]),
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
    <section className="admin-workspace">
      <div className="admin-shell">
        <div className="admin-masthead">
          <span className="admin-issue" aria-hidden="true">01</span>
          <div>
            <p className="eyebrow">Recruitment workspace</p>
            <h1 className="admin-title">
              Review the next builders.
            </h1>
            <p className="admin-description">
              Review responses, shortlist applicants, export loaded records, and communicate with selected candidates.
            </p>
          </div>
          <span className="admin-badge">
            <VerifiedUser size={20} /> Admin workspace
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="admin-error"
          >
            <p>{error}</p>
            <button
              className="button-secondary"
              onClick={() => loadBatch(cursor)}
              disabled={loading}
            >
              <Refresh size={15} /> Try again
            </button>
          </div>
        )}

        {loading && !applicants.length ? (
          <div role="status" className="admin-loading">
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
          <div className="admin-load-more">
            <button
              onClick={() => loadBatch(cursor)}
              disabled={loading}
              className="button-secondary"
            >
              <ArrowDownward size={16} />
              {loading ? "Loading…" : "Load next 50 applications"}
            </button>
            <p className="text-xs text-[#80868b]">
              Filters and export apply to loaded applications.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
