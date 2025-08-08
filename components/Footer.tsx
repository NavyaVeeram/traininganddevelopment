"use client";

export default function Footer() {
  return (
    <footer className="fixed mt-5 bottom-0 left-0 w-full bg-gray-100 text-center py-1 text-sm font-bold text-gray-600 shadow-inner z-40">
      &copy; {new Date().getFullYear()} Greentech Industries (India) Pvt. Ltd. All rights reserved.
    </footer>
  );
}
