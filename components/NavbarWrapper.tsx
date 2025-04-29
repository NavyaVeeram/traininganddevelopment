"use client";

import { usePathname } from "next/navigation";
import NavigationMenuDemo from "./ui/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return <NavigationMenuDemo />;
}
