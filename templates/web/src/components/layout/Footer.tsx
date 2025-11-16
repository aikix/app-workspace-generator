import Link from 'next/link';

/**
 * Footer component - Site footer with copyright and legal links
 *
 * Features:
 * - Copyright notice with dynamic year
 * - Legal links (Terms, Privacy)
 * - Responsive layout
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {{pascalCase projectName}}. All rights reserved.
          </p>
          <nav className="flex items-center gap-4" aria-label="Footer navigation">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

