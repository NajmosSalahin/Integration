import ContentLayout from '../../components/ContentLayout';

export default function Payments() {
  return (
    <ContentLayout title="Payments">
      <div className="space-y-6 text-gray-400 leading-relaxed">
        <p>
          We accept bKash as our only payment method. Our process is simple, transparent,
          and designed to feel safe even for first-time buyers.
        </p>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How It Works
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">1.</span>
              <div>
                <strong className="text-[#e8e8e8]">Place your order</strong>
                <p className="mt-1">
                  Add items to your cart, fill in your delivery details at checkout, and submit
                  your order. You will see an order confirmation right away.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">2.</span>
              <div>
                <strong className="text-[#e8e8e8]">Receive payment instructions</strong>
                <p className="mt-1">
                  You will receive an email with our bKash number and the exact amount to send.
                  This email arrives within minutes of placing your order.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">3.</span>
              <div>
                <strong className="text-[#e8e8e8]">Send payment via bKash</strong>
                <p className="mt-1">
                  Open your bKash app, send the exact amount to the number provided, and
                  keep the transaction ID. You can reply to the confirmation email with
                  your transaction ID to speed things up.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold mt-0.5">4.</span>
              <div>
                <strong className="text-[#e8e8e8]">Order confirmed</strong>
                <p className="mt-1">
                  Once we verify your payment, your order status changes to confirmed and
                  we begin preparing it for shipment. You will receive an email confirmation.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Payment Deadlines
          </h2>
          <p>
            Please complete your payment within 24 hours of placing your order.
            Orders not paid within this window will be automatically cancelled.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Security
          </h2>
          <p>
            We never ask for your bKash PIN or password. Our team will only ever provide
            you with a number to send money to. If someone asks for your PIN, it is not us.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
