"use client"
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationMenuDemo from "@/components/ui/Navbar";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = useMemo(() => pathname === "/", [pathname]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      setIsLoggedIn(true); // Set user as logged in
    } else if (!isLoginPage) {
      router.push("/"); // Redirect to login page if not logged in
    }
  }, [pathname, router, isLoginPage]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Training and Development</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css" /> */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Only render the navigation menu if logged in */}
     <div> {!isLoginPage && isLoggedIn && <NavigationMenuDemo />}</div>  

        {/* Render the login page content if not logged in */}
        {!isLoggedIn ? (
          <>{children}</> // Show login page (children) when not logged in
        ) : (
          <>{children}</> // Render the actual page content after login (this part can contain your dashboard or any other content)
        )}
      </body>
    </html>
  );
}
