import ContentLayout from '../../components/ContentLayout';

export default function Cookies() {
  return (
    <ContentLayout title="Cookie Policy">
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>
          Last updated: September 2026
        </p>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What Are Cookies
          </h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They help the site remember your preferences and keep you logged in.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Cookies We Use
          </h2>
          <ul className="space-y-3">
            <li>
              <strong className="text-[#e8e8e8]">Essential Cookies</strong>
              <p className="mt-1">
                These are required for the website to function. They keep you logged in,
                remember your cart contents, and maintain your session. These cannot be
                disabled.
              </p>
            </li>
            <li>
              <strong className="text-[#e8e8e8]">Authentication Cookies</strong>
              <p className="mt-1">
                Used to verify your identity and maintain your login session across page
                refreshes. These are httpOnly cookies that cannot be accessed by JavaScript.
              </p>
            </li>
          </ul>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What We Do NOT Use
          </h2>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Third-party tracking cookies</li>
            <li>Advertising or remarketing cookies</li>
            <li>Social media tracking pixels</li>
          </ul>
          <p className="mt-3">
            We do not use Google Analytics, Facebook Pixel, or any similar tracking tools
            at this time. If this changes in the future, this policy will be updated
            accordingly.
          </p>
        </div>

        <div>
          <h2
            className="text-lg tracking-[0.15em] uppercase text-[#e8e8e8] mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Managing Cookies
          </h2>
          <p>
            You can control cookies through your browser settings. Disabling essential
            cookies may prevent the website from functioning properly (e.g., staying
            logged in, cart persistence).
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
