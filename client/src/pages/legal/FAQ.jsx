import ContentLayout from '../../components/ContentLayout';

export default function FAQ() {
  return (
    <ContentLayout title="FAQ">
      <div className="space-y-8">
        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How do I place an order?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Browse our collection, select your size, and add items to your cart.
            When you are ready, proceed to checkout and fill in your delivery details.
            You will then receive instructions on how to complete payment via bKash.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What payment methods do you accept?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We currently accept bKash payments only. After placing your order, you will
            receive a confirmation with our bKash number and the exact amount to send.
            Once we verify your payment, your order moves to confirmed status.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How do I know my size?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Each product page includes available sizes (S, M, L, XL, XXL). Our tees
            follow standard unisex sizing. If you are between sizes, we recommend going
            one size up for a relaxed fit. If you need specific measurements, reach out
            via our contact page.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How long does delivery take?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Delivery within Dhaka typically takes 2-3 business days.
            Outside Dhaka, expect 3-5 business days after your order is confirmed.
            You will receive updates on your order status via email.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Can I cancel or modify my order?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            You can cancel your order before it moves to confirmed status. Once an order
            is confirmed and being prepared for shipment, modifications are no longer possible.
            Contact us as soon as possible if you need to make changes.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What if my item arrives damaged?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Contact us within 48 hours of receiving your order with photos of the damage.
            We will arrange a replacement or full refund. Your satisfaction matters to us.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Do you ship internationally?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Currently we only ship within Bangladesh. International shipping is something
            we are exploring for future updates.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
