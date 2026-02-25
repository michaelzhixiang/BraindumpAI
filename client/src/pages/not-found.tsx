import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f5efe7]">
      <div className="paper-card rounded-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-[#9e9484] mx-auto mb-6" />
        <h1 className="text-2xl font-serif font-bold mb-4 text-[#2b2520]">404 Page Not Found</h1>
        <p className="text-[#9e9484] mb-8">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-lg paper-btn font-medium">
          Return Home
        </Link>
      </div>
    </div>
  );
}
