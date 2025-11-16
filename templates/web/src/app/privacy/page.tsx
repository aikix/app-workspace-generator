export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data handling practices',
};

/**
 * Privacy Policy page
 *
 * IMPORTANT: Replace this placeholder content with your actual privacy policy.
 * Ensure GDPR, CCPA, and other applicable privacy law compliance.
 */
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-zinc dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground text-base">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email address)</li>
          <li>Profile information</li>
          <li>Communications with us</li>
          <li>Usage data and analytics</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze trends, usage, and activities</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not share your personal information with third parties except as described in this policy or with your
          consent.
        </p>

        <h2>4. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to collect and track information about your use of our
          service. You can control cookies through your browser settings.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized
          access, disclosure, alteration, and destruction.
        </p>

        <h2>6. Your Rights (GDPR)</h2>
        <p>If you are in the European Economic Area (EEA), you have certain data protection rights, including:</p>
        <ul>
          <li>The right to access your personal data</li>
          <li>The right to rectification</li>
          <li>The right to erasure</li>
          <li>The right to restrict processing</li>
          <li>The right to data portability</li>
          <li>The right to object</li>
        </ul>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          Our service is not directed to children under 13 (or other age as required by local law), and we do not
          knowingly collect personal information from children.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new
          privacy policy on this page.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at{' '}
          <a href="mailto:privacy@example.com" className="text-primary hover:underline">
            privacy@example.com
          </a>
          .
        </p>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-0">
            <strong>Note:</strong> This is placeholder content. Replace with your actual privacy policy drafted by a
            legal professional and ensure compliance with GDPR, CCPA, and other applicable laws.
          </p>
        </div>
      </div>
    </div>
  );
}

