import ContentLayout from '../../components/ContentLayout';

export default function Terms() {
  return (
    <ContentLayout title="Terms of Service">
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>
          Last updated: September 2026
        </p>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Integration website and services, you agree to be
            bound by these Terms of Service. If you do not agree, please do not use
            our services.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Accounts
          </h2>
          <ul className="space-y-1 ml-4 list-disc">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 13 years old to create an account</li>
            <li>One account per person</li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Products and Orders
          </h2>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Product images are for illustration purposes; actual products may vary slightly</li>
            <li>We reserve the right to limit order quantities</li>
            <li>Prices are shown in BDT and include applicable taxes</li>
            <li>We reserve the right to refuse or cancel any order</li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Payment
          </h2>
          <p>
            All payments are made via bKash. Orders not paid within 24 hours will be
            automatically cancelled. We are not responsible for any issues arising from
            incorrect payment amounts or wrong recipient numbers provided by the buyer.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Intellectual Property
          </h2>
          <p>
            All designs, logos, and content on this website are the property of Integration.
            You may not reproduce, distribute, or create derivative works without our
            written consent.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Limitation of Liability
          </h2>
          <p>
            Integration is not liable for any indirect, incidental, or consequential damages
            arising from the use of our products or services. Our total liability shall not
            exceed the amount paid for the order in question.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Changes to Terms
          </h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of our
            services after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
