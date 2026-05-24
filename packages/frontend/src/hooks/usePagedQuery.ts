import { useCallback, useEffect, useState } from "react";
import { useFetch } from "./useFetch";
import { buildQueryString } from "../utils/formatters";
import type { PaginatedResult } from "../types/transaction";

const LIMIT = 20;

export function usePagedQuery<T>(
  path: string,
  filters: Record<string, string | undefined>
) {
  const [page, setPage] = useState(1);
  const { data, loading, error, execute } = useFetch<PaginatedResult<T>>();

  const fetchPage = useCallback(
    async (p: number) => {
      const qs = buildQueryString({
        ...filters,
        page: String(p),
        limit: String(LIMIT),
      });
      return execute(`${path}${qs}`);
    },
    [execute, path, filters]
  );

  useEffect(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  const resetToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    limit: LIMIT,
    resetToFirstPage,
    goToPage,
  };
}
