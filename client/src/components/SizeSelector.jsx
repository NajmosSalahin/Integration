export default function SizeSelector({ sizes, stock, selectedSize, onSelect }) {
  const getStockStatus = (size) => {
    const item = stock?.find((s) => s.size === size);
    return item ? item.inStock : true;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-[0.2em] uppercase text-gray-400">
          Select Size
        </span>
        {selectedSize && (
          <span className="text-xs text-blue-400">{selectedSize}</span>
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
              className={`
                relative px-4 py-2 text-sm tracking-wider uppercase rounded-sm border transition-all duration-200
                ${isSelected
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : inStock
                    ? 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white cursor-pointer'
                    : 'border-gray-800 text-gray-700 cursor-not-allowed line-through'
                }
              `}
            >
              {size}
              {!inStock && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gray-700" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
