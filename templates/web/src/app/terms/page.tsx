export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and usage guidelines',
};

/**
 * Terms of Service page
 *
 * IMPORTANT: Replace this placeholder content with your actual terms of service.
 * Consult with legal counsel to ensure compliance with applicable laws.
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-zinc dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground text-base">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this service, you accept and agree to be bound by the terms and provision of this
          agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on our
          service for personal, non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on our service are provided on an &apos;as is&apos; basis. We make no warranties, expressed or
          implied, and hereby disclaim and negate all other warranties including, without limitation, implied
          warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
          intellectual property or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for
          loss of data or profit, or due to business interruption) arising out of the use or inability to use the
          materials on our service.
        </p>

        <h2>5. Privacy</h2>
        <p>
          Your use of our service is also governed by our Privacy Policy. Please review our{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to revise these terms of service at any time without notice. By using this service you
          are agreeing to be bound by the then current version of these terms of service.
        </p>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-0">
            <strong>Note:</strong> This is placeholder content. Replace with your actual terms of service drafted by a
            legal professional.
          </p>
        </div>
      </div>
    </div>
  );
}

