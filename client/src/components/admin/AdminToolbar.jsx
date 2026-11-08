import { Search } from 'lucide-react';

const selectClass =
  'px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer';

export default function AdminToolbar({
  query,
  onQueryChange,
  searchPlaceholder = 'Search...',
  searchLabel = 'Search',
  filters = [],
  sort,
  onSortChange,
  sortOptions = [],
  total,
  totalLabel = 'item',
  totalLabelPlural,
  children,
}) {
  const countLabel =
    total === 1 ? totalLabel : totalLabelPlural || `${totalLabel}s`;

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            aria-label={filter.label}
            className={selectClass}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        {sortOptions.length > 0 && (
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort"
            className={selectClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-secondary)]" aria-live="polite">
          {total} {countLabel}
        </p>
        {children}
      </div>
    </div>
  );
}
