import { Wallet } from 'lucide-react';
import { PAYMENT_METHODS } from '../../lib/paymentMethods';

const PAYMENT_CARD_STYLES = {
  bkash: 'text-pink-400',
  nagad: 'text-orange-400',
  rocket: 'text-purple-400',
  cod: 'text-emerald-400',
};

const PAYMENT_NOTES = {
  bkash: 'Send payment to our bKash number — we will contact you to confirm.',
  nagad: 'Send payment to our Nagad number — we will contact you to confirm.',
  rocket: 'Send payment to our Rocket number — we will contact you to confirm.',
  cod: 'Pay in cash when your order is delivered.',
};

export default function PaymentsSection() {
  return (
    <section aria-label="Payment methods">
      <h2
        className="text-2xl sm:text-3xl tracking-[0.15em] uppercase mb-2"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        Payment Methods
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-5">
        We accept the following methods. Choose any of them at checkout.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.value}
            className="border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Wallet size={15} className={PAYMENT_CARD_STYLES[method.value] || 'text-[var(--accent)]'} aria-hidden="true" />
                {method.label}
              </p>
              <span className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)]`}>
                Available
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {PAYMENT_NOTES[method.value]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}