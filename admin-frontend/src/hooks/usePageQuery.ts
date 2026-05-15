import { useState } from "react";

type LoaderResult<T> = {
  list?: T[];
  page?: number;
  total?: number;
};

export function usePageQuery<T>(loader: (params: { page: number; pageSize: number; keyword?: string; status?: string }) => Promise<LoaderResult<T>>) {
  const [rows, setRows] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (params: { page?: number; keyword?: string; status?: string } = {}) => {
    const nextPage = params.page ?? page;
    setLoading(true);
    setError("");
    try {
      const data = await loader({ page: nextPage, pageSize, keyword: params.keyword, status: params.status });
      setRows(data.list || []);
      setTotal(data.total || 0);
      setPage(data.page || nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    rows,
    page,
    pageSize,
    total,
    loading,
    error,
    setPageSize,
    load,
  };
}
