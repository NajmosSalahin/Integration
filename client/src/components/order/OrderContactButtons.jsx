import { MessageCircle } from 'lucide-react';
import { siteConfig, buildWhatsappUrl } from '../../lib/site';

export default function OrderContactButtons({ order }) {
  const orderShort = String(order._id).slice(-8).toUpperCase();

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={buildWhatsappUrl(
          siteConfig.contact.whatsappNumber,
          `Hi, I placed order #${orderShort} on Integration. Total: ৳${order.totalAmount.toLocaleString()}. Looking forward to hearing from you.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <MessageCircle size={14} aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={`https://m.me/${siteConfig.contact.messengerPage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
      >
        Messenger
      </a>
      <a
        href={`mailto:${siteConfig.contact.email}`}
        className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] text-sm rounded-lg transition-colors"
      >
        Email
      </a>
    </div>
  );
}