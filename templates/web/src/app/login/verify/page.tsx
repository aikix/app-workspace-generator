"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmailSignInLink } from '@/lib/firebase/auth-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const { user, error } = await verifyEmailSignInLink();

      if (error) {
        setStatus('error');
        setError(error);
      } else if (user) {
        setStatus('success');
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    verify();
  }, [router]);

  return (
    <div className="container flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification failed'}
          </CardTitle>
          <CardDescription>
            {status === 'verifying' && 'Please wait while we verify your sign-in link'}
            {status === 'success' && 'You have been signed in successfully'}
            {status === 'error' && 'There was a problem verifying your sign-in link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-muted-foreground">Redirecting you to the home page...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
              <p className="text-sm text-muted-foreground">
                The link may have expired or already been used. Please try signing in again.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

