import ContentLayout from '../../components/ContentLayout';

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Browse our collection, select your size, and add items to your cart. When you are ready, proceed to checkout, choose your preferred payment method, and fill in your delivery details. For bKash, Nagad, or Rocket orders, you will then receive instructions on how to complete your payment.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bKash, Nagad, Rocket, and cash on delivery. For manual digital payments, you will receive a confirmation with our number and the exact amount to send. Once we verify your payment, your order moves to confirmed status. For cash on delivery, no advance payment is required.',
  },
  {
    q: 'How do I know my size?',
    a: 'Each product page includes available sizes (S, M, L, XL, XXL). Our tees follow standard unisex sizing. If you are between sizes, we recommend going one size up for a relaxed fit. If you need specific measurements, reach out via our contact page.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery within Dhaka typically takes 2-3 business days. Outside Dhaka, expect 3-5 business days after your order is confirmed. You will receive updates on your order status via email.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'You can cancel your order before it moves to confirmed status. Once an order is confirmed and being prepared for shipment, modifications are no longer possible. Contact us as soon as possible if you need to make changes.',
  },
  {
    q: 'What if my item arrives damaged?',
    a: 'Contact us within 48 hours of receiving your order with photos of the damage. We will arrange a replacement or full refund. Your satisfaction matters to us.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we only ship within Bangladesh. International shipping is something we are exploring for future updates.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FAQ() {
  return (
    <ContentLayout
      title="FAQ"
      description="Find answers to common questions about orders, payments, sizing, delivery, and returns at Integration."
      path="/faq"
      jsonLd={faqLd}
    >
      <div className="space-y-8">
        {faqs.map(({ q, a }) => (
          <div key={q}>
            <h2
              className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {q}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {a}
            </p>
          </div>
        ))}
      </div>
    </ContentLayout>
  );
}