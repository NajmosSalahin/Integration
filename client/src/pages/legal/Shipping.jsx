import ContentLayout from '../../components/ContentLayout';

export default function Shipping() {
  return (
    <ContentLayout title="Shipping Policy">
      <div className="space-y-6 text-gray-400 leading-relaxed">
        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Delivery Areas
          </h2>
          <p>
            We currently deliver across Bangladesh. Delivery is available to all major
            cities and most rural areas through our trusted courier partners.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Delivery Timeframes
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span><strong className="text-[#e8e8e8]">Inside Dhaka:</strong> 2-3 business days after order confirmation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span><strong className="text-[#e8e8e8]">Outside Dhaka:</strong> 3-5 business days after order confirmation</span>
            </li>
          </ul>
          <p className="mt-3">
            Business days are Sunday through Thursday. Orders placed on Friday will be
            processed on Sunday.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Shipping Cost
          </h2>
          <p>
            Shipping charges are calculated at checkout based on your delivery location.
            The exact cost will be displayed before you confirm your order.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Order Tracking
          </h2>
          <p>
            Once your order is confirmed, you can track its status from your account
            under My Orders. We will also send email updates at each stage of the process.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Failed Deliveries
          </h2>
          <p>
            If a delivery attempt fails due to incorrect address or unavailable recipient,
            our courier partner will contact you to arrange a second attempt. If you need
            to update your delivery address after placing an order, contact us immediately.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
