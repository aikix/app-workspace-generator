import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata = {
  title: 'About',
  description: 'Learn more about our company and team',
};

/**
 * About page component
 *
 * Displays information about the company/team.
 * Customize this content for your project.
 */
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>What drives us forward</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Add your company mission statement here. Explain what your organization stands for and what you aim to
              achieve.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
            <CardDescription>How we started</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Share your company&apos;s origin story here. Talk about the founding, key milestones, and growth journey.
            </p>
            <p className="text-muted-foreground">
              This section helps visitors understand your background and builds trust with potential customers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>We&apos;d love to hear from you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Questions or feedback? Reach out to us at{' '}
              <a href="mailto:hello@example.com" className="text-primary hover:underline">
                hello@example.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

