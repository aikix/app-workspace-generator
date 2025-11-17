import { WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Offline Page
 *
 * Displayed when the user is offline and the requested page is not cached
 */
export default function OfflinePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">You're Offline</h1>

          <p className="text-muted-foreground mb-6">
            It looks like you've lost your internet connection. Please check your connection and try
            again.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Some pages may still be available offline if you've visited them before.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Offline',
  description: 'You are currently offline',
};

