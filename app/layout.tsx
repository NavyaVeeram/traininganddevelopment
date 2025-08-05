"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationMenuDemo from "@/components/ui/Navbar";
import Footer from "@/components/Footer";
// import BackButton from "@/components/BackButton";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = useMemo(() => pathname === "/", [pathname]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      setIsLoggedIn(true); // Set user as logged in
      setLoading(false);
    } else if (!isLoginPage) {
      setIsLoggedIn(false);
      setLoading(false);
      setShowMessage(true);
      // Redirect immediately after showing message briefly
      setTimeout(() => {
        router.push("/");
      }, 1000); // 1 second delay to show message
    } else {
      setLoading(false);
    }
  }, [pathname, router, isLoginPage]);

  if (loading) {
    // While checking login status, render nothing or a loading indicator
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Training and Development</title>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="flex justify-center items-center min-h-screen text-gray-700">
            Checking authentication...
          </div>
        </body>
      </html>
    );
  }

  if (showMessage) {
    // Show please login message and immediately redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Training and Development</title>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="flex justify-center items-center min-h-screen text-red-600 font-semibold text-lg">
            Please login...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Training and Development</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Only render the navigation menu if logged in */}
        <div> {!isLoginPage && isLoggedIn && <NavigationMenuDemo />}</div>

        {/* Render the login page content if not logged in */}
        {!isLoggedIn ? (
          <>
            {children}
          </>
        ) : (
          <>
            {children}
            {!isLoginPage && <Footer />}
            {/* {!isLoginPage && <BackButton />} */}
          </>
        )}
      </body>
    </html>
  );
}
