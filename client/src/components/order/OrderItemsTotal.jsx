export default function OrderItemsTotal({ order }) {
  return (
    <section>
      <h2
        className="text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-3"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Items
      </h2>
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.title} <span className="text-[var(--text-secondary)]">({item.size})</span> &times;{' '}
              {item.quantity}
            </span>
            <span className="text-[var(--text-primary)]">
              ৳{(item.priceAtOrder * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)] mt-3 pt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-xs text-[var(--text-secondary)]">Subtotal</span>
          <span className="text-sm text-[var(--text-primary)]">
            ৳{(order.totalAmount + order.discountAmount).toLocaleString()}
          </span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-xs text-[var(--text-secondary)]">Coupon ({order.couponCode})</span>
            <span className="text-sm text-emerald-500">-৳{order.discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm font-bold">Total</span>
          <span className="text-lg text-[var(--accent)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ৳{order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
}