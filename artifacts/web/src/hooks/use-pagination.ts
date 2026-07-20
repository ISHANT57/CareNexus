import { useUrlFilters } from "@/hooks/use-url-filters";

export function usePagination(pageSize = 20) {
  const { filters, setFilter } = useUrlFilters<{ page: string }>();
  const page = Math.max(1, Number(filters.page) || 1);
  const setPage = (p: number) => setFilter("page", p > 1 ? String(p) : undefined);
  return { page, pageSize, setPage, offset: (page - 1) * pageSize };
}
