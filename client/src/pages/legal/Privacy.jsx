import ContentLayout from '../../components/ContentLayout';

export default function Privacy() {
  return (
    <ContentLayout title="Privacy Policy">
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>
          Last updated: September 2026
        </p>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Information We Collect
          </h2>
          <p>
            When you create an account or place an order, we collect the following information:
          </p>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number (for delivery contact)</li>
            <li>Delivery address</li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How We Use Your Information
          </h2>
          <ul className="space-y-1 ml-4 list-disc">
            <li>To process and fulfill your orders</li>
            <li>To send order status updates and confirmations via email</li>
            <li>To communicate with you about your orders or inquiries</li>
            <li>To improve our products and services</li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Data Storage
          </h2>
          <p>
            Your data is stored securely in our database, hosted on MongoDB Atlas with
            industry-standard encryption. We do not store any payment card details, as
            all payments are made via bKash directly between you and us.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Third-Party Sharing
          </h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share
            your delivery details with our courier partners solely for the purpose of
            fulfilling your order.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Email Communications
          </h2>
          <p>
            We send transactional emails related to your orders (confirmations, status updates,
            receipts). We do not send marketing emails unless you have explicitly opted in.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Your Rights
          </h2>
          <p>
            You have the right to access, update, or delete your personal information.
            Contact us via the contact page to make any changes to your data.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. Any changes will be reflected
            on this page with an updated date.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
