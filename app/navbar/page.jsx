"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  FileEdit,
  ClipboardCheck,
  Users,
  CheckSquare,
  Database,
  ThumbsUp,
  BarChart2,
  Edit3,
  Menu,
  X,
  UserCircle2,
  LogOut,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  {
    label: "Requisition",
    icon: ClipboardCheck,
    dropdown: [
      { label: "Update Form", href: "/updateform", icon: FileEdit },
      { label: "Request Form", href: "/requestform", icon: Users },
    ],
  },
  { label: "Check Out Form", href: "/checkoutform", icon: CheckSquare },
  {
    label: "Status",
    icon: BarChart2,
    dropdown: [
      { label: "Room Wise", href: "/status/roomwise", icon: Home },
      { label: "Overall Report", href: "/status/overall", icon: BarChart2 },
      { label: "Edit Room", href: "/status/edit-room", icon: Edit3 },
    ],
  },
  { label: "Master Data", href: "/masterdata", icon: Database },
  { label: "Approve", href: "/approve", icon: ThumbsUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [leaveTimer, setLeaveTimer] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
  const profileRef = useRef(null);
  
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, []);

useEffect(() => {
  function handleClickOutside(event) {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setTimeout(() => {
        setProfileOpen(false); // ✅ Delay to allow logout to complete
      }, 200); 
    }
  }

  if (profileOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [profileOpen]);



  const isActive = (href) => pathname === href;

  const handleMouseEnter = (idx) => {
    clearTimeout(leaveTimer);
    const timer = setTimeout(() => setOpenDropdown(idx), 200);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer);
    const timer = setTimeout(() => setOpenDropdown(null), 300);
    setLeaveTimer(timer);
  };
const handlelogout = () => {
  console.log("Logging out...");
  localStorage.setItem("isLoggedIn", "false");
  setProfileOpen(false);
  window.location.href = '/'; // Force full reload
};




 if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between w-full px-2 sm:px-4 py-2">
        <div className="flex items-center justify-start">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Greentech Industries
          </Link>
        </div>

        <ul className="hidden md:flex items-center space-x-4">
          {NAV_LINKS.map((link, idx) => {
            const isDropdownOpen = openDropdown === idx;

            return (
              <li
                key={link.label}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                {!link.dropdown ? (
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-sky-500 bg-gray-100 border-b-2 border-sky-500"
                        : "text-gray-900 hover:text-sky-500 hover:bg-gray-100"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-all duration-200 ${
                        isDropdownOpen
                          ? "text-sky-500 bg-gray-100 border-b-2 border-sky-500"
                          : "text-gray-900 hover:text-sky-500 hover:bg-gray-100"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 ml-1 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-56 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-dropdown">
                        <ul className="py-2">
                          {link.dropdown.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 text-sm transition rounded-md ${
                                  isActive(item.href)
                                    ? "text-sky-500 bg-gray-100"
                                    : "text-gray-900 hover:text-sky-500 hover:bg-gray-100"
                                }`}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}

          {/* Profile Icon */}
          <li className="relative ml-2" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 hover:bg-gray-100 ${
                profileOpen ? "bg-gray-100" : ""
              }`}
              aria-label="Profile"
            >
              <UserCircle2 className="w-7 h-7 text-gray-700" />
            </button>
            {/* Profile Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-64 z-50 transition-all duration-200 ${
                profileOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{ transitionProperty: "opacity, transform" }}
            >
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5 animate-profile-dropdown">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircle2 className="w-10 h-10 text-sky-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{username || "Guest User"}</div>
                    
                  </div>
                </div>
                <hr className="mb-3" />
               <button
  className="flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
  onClick={(e) => {
    e.stopPropagation(); 
    handlelogout();
  }}
>
  <LogOut className="w-4 h-4" />
  Logout
</button>

              </div>
            </div>
          </li>
        </ul>

        <div className="md:hidden flex items-center gap-2">
          {/* Profile Icon for mobile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="Profile"
            >
              <UserCircle2 className="w-7 h-7" />
            </button>
            {/* Profile Dropdown */}
            <div
              className={`absolute right-0 mt-2 w-64 z-50 transition-all duration-200 ${
                profileOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{ transitionProperty: "opacity, transform" }}
            >
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5 animate-profile-dropdown">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircle2 className="w-10 h-10 text-sky-500" />
                  <div>
                     <div className="font-semibold text-gray-900">{username || "Guest User"}</div>
                   
                  </div>
                </div>
                <hr className="mb-3" />
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                  onClick={handlelogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          <button
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, idx) => (
              <React.Fragment key={link.label}>
                <li
                  onMouseEnter={() => handleMouseEnter(idx)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === idx ? null : idx))
                    }
                    className="flex justify-between items-center px-4 py-3 text-sm text-gray-900 w-full hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </span>
                    {link.dropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === idx ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </li>
                {link.dropdown && openDropdown === idx && (
                  <ul className="bg-gray-50">
                    {link.dropdown.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-6 py-3 text-sm transition ${
                            isActive(item.href)
                              ? "text-sky-500 bg-gray-100"
                              : "text-gray-900 hover:text-sky-500 hover:bg-gray-100"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdown {
          animation: dropdown 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes profile-dropdown {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-profile-dropdown {
          animation: profile-dropdown 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </nav>
  );
}
