import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ background: 'var(--paper-bg)' }}>
      <div className="paper-card rounded-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--paper-secondary)' }} />
        <h1 className="text-2xl font-heading font-bold mb-4" style={{ color: 'var(--paper-fg)' }}>404 Page Not Found</h1>
        <p className="mb-8" style={{ color: 'var(--paper-secondary)' }}>
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg paper-btn font-medium">
          Return Home
        </Link>
      </div>
    </div>
  );
}
