# Security policy

## Supported versions

Security fixes are applied to the latest release on `master`.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private vulnerability reporting on this repository:

1. Open the **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the affected endpoint or page, reproduction steps, and the impact you believe is possible.

You can expect an acknowledgement within a few days. Please give me a reasonable window to investigate and ship a fix before any public disclosure.

## Scope

In scope:

- Authentication, session, and authorization flaws
- Injection, XSS, CSRF, and request-forgery issues
- Order, coupon, stock, or payment-status manipulation
- Exposure of secrets, personal data, or admin functionality
- Denial-of-service vectors that are cheap to trigger

Out of scope:

- Findings that require a compromised device or browser extension
- Social engineering of the store owner
- Missing security headers with no demonstrated impact
- Automated scanner output without a reproducible proof of concept
- The demo seed data or locally generated accounts

## Security posture

This repository intentionally contains no production secrets. Environment values are supplied at deploy time. The public demo seed uses local placeholder assets and generic product data.

If you believe a secret has been committed, report it privately and rotate the credential immediately. Do not paste the secret into an issue.
