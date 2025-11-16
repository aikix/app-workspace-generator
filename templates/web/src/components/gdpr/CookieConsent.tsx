"use client";

/**
 * GDPR Cookie Consent Banner
 *
 * Simple cookie consent implementation using localStorage.
 * Shows banner on first visit, remembers user's choice.
 *
 * For production use, consider:
 * - Cookie categorization (necessary, analytics, marketing)
 * - Integration with analytics (Google Analytics, etc.)
 * - Privacy policy link
 * - Cookie management panel
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CONSENT_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

  /**
   * Handle accept cookies
   */
  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShow(false);

    // TODO: Initialize analytics/tracking here if needed
    // Example: gtag('consent', 'update', { analytics_storage: 'granted' });
  };

  /**
   * Handle decline cookies
   */
  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShow(false);

    // TODO: Ensure analytics are disabled
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 shadow-lg border-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">🍪 Cookie Consent</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience and analyze our traffic. By
              clicking &quot;Accept&quot;, you consent to our use of cookies.{' '}
              <a href="/privacy" className="underline hover:text-primary">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 sm:flex-none"
            >
              Decline
            </Button>
            <Button onClick={handleAccept} className="flex-1 sm:flex-none">
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

