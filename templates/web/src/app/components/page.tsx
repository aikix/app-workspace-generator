import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

/**
 * Components showcase page - Demonstrates all available UI components
 */
export default function ComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Component Library</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Reusable UI components with Tailwind CSS styling and full accessibility support.
        </p>
      </header>

      {/* Button Showcase */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Buttons</h2>

        <div className="space-y-8">
          {/* Variants */}
          <div>
            <h3 className="text-lg font-medium mb-4">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button>Medium (Default)</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="text-lg font-medium mb-4">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="w-full">Full Width</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Card Showcase */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Basic Card</h3>
              <p className="text-sm text-muted-foreground">
                A simple card with just a body section.
              </p>
            </CardContent>
          </Card>

          {/* Card with Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Card with Header</CardTitle>
              <CardDescription>
                This card includes a header section separated by a border.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Full Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complete Card</CardTitle>
              <CardDescription>
                A card with header, body, and footer sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This demonstrates all card sections working together.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
                <Button size="sm">Confirm</Button>
              </div>
            </CardFooter>
          </Card>

          {/* Hover Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Hover Effect</h3>
              <p className="text-sm text-muted-foreground">
                This card has a hover effect with enhanced shadow.
              </p>
            </CardContent>
          </Card>

          {/* Borderless Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">No Border</h3>
              <p className="text-sm text-muted-foreground">
                This card has no border, just a shadow.
              </p>
            </CardContent>
          </Card>

          {/* Interactive Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Interactive Card</CardTitle>
              <CardDescription>
                Combine hover effects with actions in the footer.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Combined Example */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Combined Example</h2>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-3 justify-end w-full">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Accessibility Note */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">♿ Accessibility</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          All components include proper ARIA attributes, focus states, and keyboard navigation support.
          They follow WCAG 2.1 AA guidelines for color contrast and interactive elements.
        </p>
      </section>
    </div>
  );
}
