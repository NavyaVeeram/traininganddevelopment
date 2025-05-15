import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-9xl font-extrabold text-gray-900 select-none">404</div>
      <div className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</div>
      <div className="text-gray-500 mt-2 max-w-md text-center">
        Sorry, the page you are looking for does not exist.{' '}
        <span role="img" aria-label="confused face" className="inline-block">
          😕
        </span>
      </div>
      <Link href="/">
        <a className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition">
          Go back home
        </a>
      </Link>
    </div>
  );
}
