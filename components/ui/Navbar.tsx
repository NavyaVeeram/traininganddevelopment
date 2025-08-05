
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Menu, User, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {  usePathname } from "next/navigation";
const training = [
  { title: "Annual Training Calender - IATF/HSE", href: "/annualtraining" },
  { title: "Requirement - IATF/HSE", href: "requirement" },
  { title: "Approval Form", href: "/approvalform" },
  { title: "Approval Form ", href: "/approvalformforhrhod" },
  { title: "Approved Data", href: "/approveddata" },
];

const transaction = [
  { title: "Training Attendance Entry", href: "/trainingattendance" },
  { title: "Monthly Training Particulars", href: "/montrainparticulars" },
];

const tet = [
  { title: "Generate TEE Forms", href: "tetformsgenerate" },
  { title: "Generic Forms", href: "tetformsgeneric" },
  { title: "Reports", href: "/ratingdistribution" },
];

const masterreport = [
  { title: "Employee History", href: "/emphistory" },
  { title: "Qualified Trainers List", href: "/quatrainlist" },
  { title: "Training Cost/Budget", href: "/traincost" },
  { title: "Training Agencies", href: "/trainingagencies" },
  { title: "Add Training Record", href: "/trainingrecord" },
  { title: "Update TL", href: "/tetformgeneratefortl" },
  { title: "Total Head Count", href: "/headcount" },
  { title: "Training Hours", href: "/totrainhrs" },
];

const trainingcertificates = [
  { title: "Upload Certificates", href: "/uploadcer" },
  { title: "Upload Materials", href: "/uploadmaterials" },
];

const menuGroups = [
  { title: "Training Calendar", items: training },
  {
    title: "Transaction",
    items: transaction,
    show: (role: string) =>
      role !== "Res_Person" && role !== "HOS" && role !== "HOD",
  },
  {
    title: "Training Effectiveness",
    items: tet,
    show: (role: string) => role !== "Res_Person",
  },
  {
    title: "Upload",
    items: trainingcertificates,
    show: (role: string) =>
      role !== "Res_Person" && role !== "HOS" && role !== "HOD",
  },
  {
    title: "T & D Report",
    items: masterreport,
    show: (role: string, dept: string) =>
      ["Res_Person", "HR_Res", "HR_Hod", "HOS", "HOD"].includes(role) &&
      !(role === "Res_Person" && dept !== "MS" && dept !== "FNTRY"),
  },
];

export default function NavigationMenuDemo() {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [accessRole, setAccessRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<null | boolean>(null);

  // const router = useRouter();
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");
    const storedDepartment = localStorage.getItem("department");
    if (storedEmployeeId && storedDepartment) {
      setEmployeeId(storedEmployeeId);
      setDepartment(storedDepartment);
    } else {
      window.location.href = "/";
      return;
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(
          `/api/get_access_role?employeeId=${storedEmployeeId}`
        );
        const data = await res.json();
        if (res.ok && data.Access_Role) {
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch {
        setIsAuthorized(false);
      }
    };

    fetchAccessRole();
  }, []);

  useEffect(() => {
    const storedDepartment = localStorage.getItem("department");
    const storedUsername = localStorage.getItem("username");
    const storedEmployeeId = localStorage.getItem("employeeId");
    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = "/";
    }
  }, [department, username, employeeId]);

  // --- Outside click handler for desktop dropdown ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setHoveredMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isAuthorized === null) return null;
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Unauthorized</h2>
          <p className="mt-2">You do not have access to view this page.</p>
        </div>
      </div>
    );
  }

  // Helper for menu filtering
  const filterMenu = (menu: { title: string; href: string }[]) =>
    menu.filter((component) => {
      if (
        component.title === "Requirement - IATF/HSE" &&
        accessRole !== "Res_Person" &&
        accessRole !== "HOS" &&
        accessRole !== "HR_Res"
      )
        return false;
      if (
        component.title === "Approval Form" &&
        accessRole !== "HOS" &&
        accessRole !== "HOD"
      )
        return false;
      if (
        component.title === "Approval Form " &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      if (
        component.title === "Training Attendance Entry" &&
        accessRole !== "HOS" &&
        accessRole !== "HOD" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      if (
        component.title === "Monthly Training Particulars" &&
        accessRole !== "HOS" &&
        accessRole !== "HOD" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      if (
        component.title === "Generate TEE Forms" &&
        accessRole !== "Res_Person" &&
        accessRole !== "HOS" &&
        accessRole !== "HOD" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )

        return false;
      if (
        component.title === "Generic Forms" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      if (
        component.title === "Upload Certificates" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      if (
        component.title === "Upload Materials" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod"
      )
        return false;
      // Masterreport logic
      const normalizedAccessRole = accessRole
        ? accessRole.trim().toUpperCase()
        : "";
      if (component.title === "Employee History" && accessRole !== "HR_Res")
        return false;
      if (
        component.title === "Qualified Trainers List" &&
        accessRole !== "HR_Res" &&
        accessRole !== "HR_Hod" &&
        accessRole !== "HOS" &&
        accessRole !== "HOD"
      )
        return false;
      if (component.title === "Training Cost/Budget" && accessRole !== "HR_Res")
        return false;
      if (component.title === "Training Agencies" && accessRole !== "HR_Res")
        return false;
      if (
        component.title === "Add Training Record" &&
        normalizedAccessRole !== "HR_RES"
      )
        return false;
      if (
        component.title === "Total Head Count" &&
        normalizedAccessRole !== "HR_RES" &&
        normalizedAccessRole !== "HR_HOD"
      )
        return false;
      if (
        component.title === "Training Hours" &&
        normalizedAccessRole !== "HR_RES" &&
        normalizedAccessRole !== "HR_HOD"
      )
        return false;
        // if (component.title === "Update TL" && (accessRole !== "Res_Person" || (department !== "MS" && department !== "FNTRY"))) {
        //               console.log("Skipping Update TL for accessRole or department:", accessRole, department);
        //               return null; // skip
        //            }
      return true;
    });

  // Desktop Navbar with robust hover/click logic
  const handleMenuClick = (title: string) => {
    if (openMenu === title) {
      setOpenMenu(null);
      setHoveredMenu(null);
    } else {
      setOpenMenu(title);
      setHoveredMenu(title);
    }
  };

  // Use same handlers for parent and submenu
  const handleMouseEnter = (title: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setHoveredMenu(title);
    setOpenMenu(title);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setHoveredMenu(null);
      setOpenMenu(null);
    }, 800);
  };

  const DesktopNav = () => (
    <div
      ref={navRef}
      className="flex items-center z-10 bg-gray-100 justify-between p-0"
    >
      <div className="text-black font-semibold text-xl ml-2">
        <Link href="/dashboard">Training Management System</Link>
      </div>
      <div className="flex items-center space-x-2 ml-auto mr-12">
        {menuGroups.map((group) => {
          const show = group.show
            ? group.show(accessRole ?? "", department)
            : true;
          if (!show) return null;
          const filteredItems = filterMenu(group.items);
          if (!filteredItems.length) return null;
          const isOpen =
            hoveredMenu === group.title || openMenu === group.title;
          return (
            <div
              key={group.title}
              className="relative"
              onMouseEnter={() => handleMouseEnter(group.title)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 font-medium text-sm transition-colors",
                  isOpen ? "text-sky-400" : "text-gray-800",
                  "hover:text-sky-400"
                )}
                type="button"
                onClick={() => handleMenuClick(group.title)}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
      {isOpen && (
        
                <div className="absolute left-0 top-full bg-white shadow-lg rounded-2xl z-30 mt-0">
                  <ul className="py-2">
                    {filteredItems.map((item) => (
                      <li
                        key={item.title + item.href}
                        className="cursor-pointer"
                      >
                        <a
                          className="block px-4 py-2.5 text-sm font-medium text-black hover:text-sky-400 transition-colors duration-150 whitespace-nowrap cursor-pointer" // ✅ Added cursor-pointer
                          onClick={(e) => {
                            e.preventDefault();
                            setHoveredMenu(null);
                            setOpenMenu(null);
                            if (pathname === item.href) {
                              router.replace(item.href);
                            } else {
                              router.push(item.href);
                            }
                          }}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
 
            </div>
          );
        })}
        <ProfileDropdown username={username} />
      </div>
    </div>
  );

  // Mobile Navbar
  const MobileNav = () => (
    <div className="md:hidden flex items-center justify-between w-full">
      <div className="text-black font-semibold text-xl">
        <Link href="/dashboard">Greentech Industries</Link>

      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      {mobileOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50">
          <div className="absolute top-0 right-0 w-3/4 h-full bg-white shadow-lg p-6 flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="self-end mb-2"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <MobileMenuGroup
              title="Training Calendar"
              items={filterMenu(training)}
            />
            {accessRole !== "Res_Person" &&
              accessRole !== "HOS" &&
              accessRole !== "HOD" && (
                <MobileMenuGroup
                  title="Transaction"
                  items={filterMenu(transaction)}
                />
              )}
            {accessRole !== "Res_Person" && (
              <MobileMenuGroup
                title="Training Effectiveness"
                items={filterMenu(tet)}
              />
            )}
            {accessRole !== "Res_Person" &&
              accessRole !== "HOS" &&
              accessRole !== "HOD" && (
                <MobileMenuGroup
                  title="Upload"
                  items={filterMenu(trainingcertificates)}
                />
              )}
            {(accessRole === "Res_Person" ||
              accessRole === "HR_Res" ||
              accessRole === "HR_Hod" ||
              accessRole === "HOS" ||
              accessRole === "HOD") &&
              !(
                accessRole === "Res_Person" &&
                department !== "MS" &&
                department !== "FNTRY"
              ) && (
                <MobileMenuGroup
                  title="T & D Report"
                  items={filterMenu(masterreport)}
                />
              )}
            <div className="mt-4">
              <ProfileDropdown username={username} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="w-full bg-gray-100 px-4 py-2 shadow-sm z-10">
      {DesktopNav()}
      {MobileNav()}
    </nav>
  );
}

function MobileMenuGroup({ title, items }: { title: string; items: { title: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-2 py-2 text-base font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <ul className="pl-4">
          {items.map((item) => (
            <li key={item.title} className="py-1">
              <Link
                href={item.href}
                className="block text-sm text-black hover:text-sky-400 transition-colors"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileDropdown({ username }: { username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
    setOpen(false);
  };

  const handleDashboard = () => {
    router.push("/dashboard");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <User className="h-5 w-5 cursor-pointer" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel className="text-center text-xl font-bold">
          {username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <button
              type="button"
              className="w-full text-left px-4 py-2"
              onClick={handleDashboard}
            >
              Dashboard
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>
          <button
            type="button"
            className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
