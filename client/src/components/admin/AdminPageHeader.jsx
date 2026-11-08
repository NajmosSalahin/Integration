export default function AdminPageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Admin
        </p>
        <h1
          className="text-3xl leading-none tracking-[0.12em] uppercase sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
