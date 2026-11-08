import { useEffect, useMemo, useState } from 'react';
import useDebouncedValue from './useDebouncedValue';

export default function useListControls(
  items = [],
  { searchText, filterFn, filterKey = '', sorters = {}, initialSort = '', pageSize = 10 } = {}
) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort || Object.keys(sorters)[0] || '');
  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filterKey, sort]);

  const filtered = useMemo(() => {
    let list = Array.isArray(items) ? items : [];
    if (filterFn) list = list.filter(filterFn);

    const term = debouncedQuery.trim().toLowerCase();
    if (term && searchText) {
      list = list.filter((item) =>
        searchText(item).join(' ').toLowerCase().includes(term)
      );
    }

    const sorter = sorters[sort];
    return sorter ? [...list].sort(sorter) : list;
  }, [items, filterFn, debouncedQuery, searchText, sorters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return {
    query,
    setQuery,
    page: currentPage,
    setPage,
    sort,
    setSort,
    filtered,
    pageItems,
    total: filtered.length,
    totalPages,
    pageSize,
  };
}
