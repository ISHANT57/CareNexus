import { useSearch, useLocation } from "wouter";

export function useUrlFilters<T extends Record<string, string>>() {
  const searchString = useSearch();
  const [path, navigate] = useLocation();

  const searchParams = new URLSearchParams(searchString);
  const filters: Partial<T> = {};
  
  for (const [key, value] of searchParams.entries()) {
    (filters as any)[key] = value;
  }

  const setFilter = (key: keyof T, value: string | undefined | null) => {
    const currentParams = new URLSearchParams(searchString);
    if (value === undefined || value === null || value === "") {
      currentParams.delete(key as string);
    } else {
      currentParams.set(key as string, value);
    }
    
    const newSearch = currentParams.toString();
    navigate(`${path}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  };

  const setFilters = (newFilters: Partial<T>) => {
    const currentParams = new URLSearchParams(searchString);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value as string);
      }
    });
    
    const newSearch = currentParams.toString();
    navigate(`${path}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  };

  const clearFilters = () => {
    navigate(path, { replace: true });
  };

  return { filters, setFilter, setFilters, clearFilters };
}
