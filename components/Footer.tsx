"use client";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-100 text-center py-1 text-sm font-bold text-gray-600 shadow-inner z-40">
      &copy; {new Date().getFullYear()} Greentech Private Limited. All rights reserved.
    </footer>
  );
}
