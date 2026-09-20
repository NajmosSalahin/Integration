export default function OrderStep({ num, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-[var(--accent)] font-bold shrink-0">{num}.</span>
      <p className="text-sm text-[var(--text-primary)]">{children}</p>
    </div>
  );
}