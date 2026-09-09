export default function SizeSelector({ sizes, stock, selectedSize, onSelect }) {
  const getStockStatus = (size) => {
    const item = stock?.find((s) => s.size === size);
    return item ? item.inStock : true;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)]">
          Select Size
        </span>
        {selectedSize && (
          <span className="text-xs text-[var(--accent)]">{selectedSize}</span>
        )}
      </div>

      <div className="flex gap-2">
        {sizes.map((size) => {
          const inStock = getStockStatus(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => inStock && onSelect(size)}
              disabled={!inStock}
              aria-label={inStock ? `Size ${size}` : `Size ${size} — out of stock`}
              className={`
                relative min-w-[48px] min-h-[48px] px-4 py-2 text-sm tracking-wider uppercase rounded-lg border transition-all duration-200
                ${isSelected
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : inStock
                    ? 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
                    : 'border-[var(--border)] text-[var(--text-secondary)]/40 cursor-not-allowed line-through'
                }
              `}
            >
              {size}
              {!inStock && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-red-500/80 border-2 border-[var(--bg-primary)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
