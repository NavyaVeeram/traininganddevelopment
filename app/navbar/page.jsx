"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, User, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const training = [
  {
    title: "Annual Training Calender - IATF/HSE",
    href: "/annualtraining",
  },
  {
    title: "Requirement - IATF/HSE",
    href: "requirement",
  },
  {
    title: "Approval Form",
    href: "/approvalform",
  },
  {
    title: "Approval Form ",
    href: "/approvalformforhrhod",
  },
  {
    title: "Approved Data",
    href: "/approveddata",
  },
];

const transaction = [
  {
    title: "Training Attendance Entry",
    href: "/trainingattendance",
  },
  {
    title: "Monthly Training Particulars",
    href: "/montrainparticulars",
  },
  {
    title: "Temporary to regular",
    href: "/temptoreg",
  },
];

const tet = [
  {
    title: " Generate Forms",
    href: "tetformsgenerate",
  },
];

const masterreport = [
  {
    title: "Employee History",
    href: "/emphistory",
  },
  {
    title: "Qualified Trainers List",
    href: "/quatrainlist",
  },
  {
    title: "Training Cost/Budget",
    href: "/traincost",
  },
  {
    title: "Training Agencies",
    href: "/trainingagencies",
  },
  {
    title: "Add Training Record",
    href: "/trainingrecord",
  },
];

const trainingcertificates = [
  {
    title: "Upload Certificates",
    href: "/uploadcer",
  },
];

const trainingmaterials = [
  {
    title: "Upload Materials",
    href: "/uploadmaterials",
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = "/";
      return;
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error fetching access role:", error);
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

  return (
    <div>
      <nav className="flex items-center z-10 bg-gray-100 justify-between p-2">
        <div className="text-black font-semibold text-xl">
          <Link href="/dashboard">Greentech Industries</Link>
        </div>

        <div className="md:hidden flex items-center space-x-4 ml-auto">
          <button onClick={toggleMenu} className="text-black">
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <NavigationMenu className="mx-10">
          <NavigationMenuList
            className={cn(
              "flex space-x-4 overflow-hidden",
              isMenuOpen ? "flex-col mt-4 space-y-2 md:flex-row md:mt-0 md:space-y-0" : "hidden md:flex"
            )}
          >
            <NavigationMenuItem className="bg-gray-100 position-relative cursor-pointer Z-10">
              <NavigationMenuTrigger className="hover:text-sky-400">Training Calendar</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[280px] max-h-[280px] cursor-pointer">
                <ul className="grid gap-2">
                  {training.map((component) => {
                    if (
                      component.title === "Annual Training Calender - IATF/HSE" &&
                      accessRole !== "HR_Res" &&
                      accessRole !== "HR_Hod"
                    ) {
                      return null;
                    }
                    if (
                      component.title === "Requirement - IATF/HSE" &&
                      accessRole !== "Res_Person" &&
                      accessRole !== "HOS" &&
                      accessRole !== "HR_Res"
                    ) {
                      return null;
                    }
                    if (component.title === "Approval Form" && accessRole !== "HOS" && accessRole !== "HOD") {
                      return null;
                    }
                    if (component.title === "Approval Form " && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                      return null;
                    }

                    return <ListItem key={component.title} title={component.title} href={component.href} />;
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
              <NavigationMenuItem className="bg-gray-100">
                <NavigationMenuTrigger className="hover:text-sky-400">Transaction</NavigationMenuTrigger>
                <NavigationMenuContent className="grid gap-2 p-1 md:w-[250px] px-3 max-h-[300px] ">
                  <ul className="grid gap-2 p-1">
                    {transaction.map((component) => {
                      if (
                        component.title === "Training Attendance Entry" &&
                        accessRole !== "HOS" &&
                        accessRole !== "HOD" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }

                      if (
                        component.title === "Monthly Training Particulars" &&
                        accessRole !== "HOS" &&
                        accessRole !== "HOD" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      if (
                        component.title === "Temporary to regular" &&
                        accessRole !== "HOS" &&
                        accessRole !== "HOD" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }

                      return <ListItem key={component.title} title={component.title} href={component.href} />;
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {accessRole !== "Res_Person" && (
              <NavigationMenuItem className="bg-gray-100">
                <NavigationMenuTrigger className="hover:text-sky-400">Training Effectiveness</NavigationMenuTrigger>
                <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[300px] ">
                  <ul className="grid gap-2 p-1">
                    {tet.map((component) => {
                      if (
                        component.title === "TET forms Generate" &&
                        accessRole !== "Res_Person" &&
                        accessRole !== "HOS" &&
                        accessRole !== "HOD" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }

                      return <ListItem key={component.title} title={component.title} href={component.href} />;
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
              <NavigationMenuItem className="bg-gray-100">
                <NavigationMenuTrigger className="hover:text-sky-400">Training certificates</NavigationMenuTrigger>
                <NavigationMenuContent
                  className="overflow-hidden"
                  style={{ "--radix-navigation-menu-viewport-height": "auto" }}
                >
                  <ul className="grid w-[150px] gap-1 p-1 md:w-[200px] md:grid-cols lg:w-[200px]">
                    {trainingcertificates.map((component) => {
                      if (component.title === "Upload Certificates" && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                        return null;
                      }

                      return <ListItem key={component.title} title={component.title} href={component.href} />;
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
              <NavigationMenuItem className="bg-gray-100 hover:bg-gray-200 hover:text-sky-400 focus:bg-gray-300 transition-all duration-300">
                <NavigationMenuTrigger className="hover:text-sky-400">Training Materials</NavigationMenuTrigger>
                <NavigationMenuContent
                  className="overflow-hidden"
                  style={{ "--radix-navigation-menu-viewport-height": "auto" }}
                >
                  <ul className="grid w-[100px] gap-1 p-1 md:w-[200px] md:grid-cols lg:w-[200px] ">
                    {trainingmaterials.map((component) => {
                      if (component.title === "Upload Materials" && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                        return null;
                      }

                      return <ListItem key={component.title} title={component.title} href={component.href} />;
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
              <NavigationMenuItem className="bg-gray-100 position-relative z-10">
                <NavigationMenuTrigger className="hover:text-sky-400">T & D Report</NavigationMenuTrigger>
                <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[250px] ">
                  <ul className="grid gap-2 p-1">
                    {masterreport.map((component) => {
                      if (
                        component.title === "Employee History" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      if (
                        component.title === "Qualified Trainers List" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      if (
                        component.title === "Training Cost/Budget" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      if (
                        component.title === "Training Agencies" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      if (
                        component.title === "Add Training Record" &&
                        accessRole !== "HR_Res" &&
                        accessRole !== "HR_Hod"
                      ) {
                        return null;
                      }
                      return <ListItem key={component.title} title={component.title} href={component.href} />;
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem className="bg-gray-100 hover:bg-gray-200 hover:text-sky-400 focus:bg-gray-300 transition-all duration-300">
              <div className="mx-5">
                <ProfileDropdown username={username} />
              </div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {isMenuOpen && (
          <div className="md:hidden max-h-[80vh] px-4 pt-2 pb-4 space-y-4 bg-background border-t animate-slide-in-left">
            <MobileNavGroup title="Training" isOpen={openGroup === "training"} toggle={() => toggleGroup("training")}>
              {training.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>

            <MobileNavGroup
              title="Transaction"
              isOpen={openGroup === "transaction"}
              toggle={() => toggleGroup("transaction")}
            >
              {transaction.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>

            <MobileNavGroup title="TET" isOpen={openGroup === "tet"} toggle={() => toggleGroup("tet")}>
              {tet.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>

            <MobileNavGroup
              title="Master Report"
              isOpen={openGroup === "masterreport"}
              toggle={() => toggleGroup("masterreport")}
            >
              {masterreport.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>

            <MobileNavGroup
              title="Training Certificates"
              isOpen={openGroup === "trainingcertificates"}
              toggle={() => toggleGroup("trainingcertificates")}
            >
              {trainingcertificates.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>

            <MobileNavGroup
              title="Training Materials"
              isOpen={openGroup === "trainingmaterials"}
              toggle={() => toggleGroup("trainingmaterials")}
            >
              {trainingmaterials.map((item) => (
                <MobileNavLink key={item.title} href={item.href}>
                  {item.title}
                </MobileNavLink>
              ))}
            </MobileNavGroup>
          </div>
        )}
      </nav>
    </div>
  );
}

function MobileNavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function MobileNavGroup({ title, children, isOpen, toggle }) {
  return (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] mt-1 space-y-1" : "max-h-0"} px-2`}>
        {isOpen && children}
      </div>
    </div>
  );
}

function ProfileDropdown({ username }) {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel className="text-center text-xl font-bold">{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <a href="/dashboard">Dashboard</a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>
          <button
            type="button"
            className="px-6 mt-2 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2 "
            onClick={handleLogout}
          >
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ListItem = React.forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn("block px-4 py-3 rounded-md text-sm font-medium text-black hover:text-sky-400 hover:bg-gray-100", className)}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-black">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";
