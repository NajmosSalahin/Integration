import ContentLayout from '../../components/ContentLayout';

export default function Returns() {
  return (
    <ContentLayout title="Returns & Refunds">
      <div className="space-y-6 text-gray-400 leading-relaxed">
        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Return Policy
          </h2>
          <p>
            We want you to love what you ordered. If you are not satisfied with your purchase,
            you may return the item within 7 days of receiving it.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Conditions for Returns
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Item must be unworn, unwashed, and in its original condition</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Original tags must be attached</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Return request must be initiated within 7 days of delivery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Item must not be from a sale or promotional offer (unless defective)</span>
            </li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How to Initiate a Return
          </h2>
          <p>
            Contact us via the contact page or email with your order number and reason for
            return. We will review your request and provide instructions for returning the item.
            Do not send items back without contacting us first.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Refund Process
          </h2>
          <p>
            Given that we operate on manual bKash payments, refunds are processed manually
            as well. Once we receive and inspect your returned item, we will send the refund
            directly to your bKash number within 3-5 business days.
          </p>
          <p className="mt-2">
            You will receive a confirmation email once the refund has been sent.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Damaged or Defective Items
          </h2>
          <p>
            If your item arrives damaged or defective, contact us within 48 hours with
            photos of the issue. We will send a replacement at no extra cost or provide
            a full refund. For defective items, return shipping is on us.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Cancellation
          </h2>
          <p>
            You may cancel your order before it is confirmed. Once an order is confirmed
            and being prepared for shipment, it cannot be cancelled. Contact us immediately
            if you wish to cancel.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
