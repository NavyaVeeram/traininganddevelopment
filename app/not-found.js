'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans animate-fadeIn">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block py-3 px-6 bg-gray-600 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors duration-300"
        >
          ⬅ Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
