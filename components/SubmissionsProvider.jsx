"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";

const SubmissionsContext = createContext(null);

export function SubmissionsProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id || session?.user?.email || null;
  const [state, setState] = useState({
    userId: null,
    departments: [],
    loading: false,
    error: "",
  });
  const activeRequest = useRef(null);

  const refreshSubmissions = useCallback(async () => {
    activeRequest.current?.abort();
    if (!userId) {
      setState({ userId: null, departments: [], loading: false, error: "" });
      return [];
    }
    const controller = new AbortController();
    activeRequest.current = controller;
    setState((previous) => ({
      userId,
      departments: previous.userId === userId ? previous.departments : [],
      loading: true,
      error: "",
    }));
    try {
      const response = await fetch("/api/check-applications", {
        signal: controller.signal,
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.submittedDepartments))
        throw new Error(result.message || "Could not load application status.");
      if (!controller.signal.aborted)
        setState({
          userId,
          departments: [...new Set(result.submittedDepartments)],
          loading: false,
          error: "",
        });
      return result.submittedDepartments;
    } catch (error) {
      if (!controller.signal.aborted)
        setState((previous) => ({
          ...previous,
          loading: false,
          error: "We couldn't check your applications. Please try again.",
        }));
      return null;
    }
  }, [userId]);

  useEffect(() => {
    refreshSubmissions();
    return () => activeRequest.current?.abort();
  }, [refreshSubmissions]);

  const markDepartmentsSubmitted = useCallback(
    (newDepartments) => {
      setState((previous) => ({
        userId,
        departments: [
          ...new Set([
            ...(previous.userId === userId ? previous.departments : []),
            ...newDepartments,
          ]),
        ],
        loading: false,
        error: "",
      }));
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      submittedDepartments: state.userId === userId ? state.departments : [],
      isLoadingSubmissions:
        isPending ||
        Boolean(userId && state.userId !== userId) ||
        state.loading,
      submissionsError: state.userId === userId ? state.error : "",
      markDepartmentsSubmitted,
      refreshSubmissions,
    }),
    [state, userId, isPending, markDepartmentsSubmitted, refreshSubmissions],
  );

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const context = useContext(SubmissionsContext);
  if (!context)
    throw new Error("useSubmissions must be used inside SubmissionsProvider");
  return context;
}
