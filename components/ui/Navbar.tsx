"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import  { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import {  X, User, ChevronDown, ChevronUp } from "lucide-react";
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
} from "@/components/ui/navigation-menu"

const training: { title: string; href: string }[] = [

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
    href: "/approveddata"
  }
]

const transaction: { title: string; href: string }[] = [
  {
    title: "Training Attendance Entry",
    href: "/trainingattendance",
  },
  {
    title: "Monthly Training Particulars",
    href: "/montrainparticulars",
  },
  // {
  //   title: "Temporary to regular",
  //   href: "/temptoreg",
  // },
]

const tet: { title: string; href: string }[] = [
  {
    title: "Generate TEE Forms",
    href: "tetformsgenerate",
  },
    {
    title: "Generic Forms",
    href: "tetformsgeneric",
  },
     {
    title: "Reports",
    href: "/ratingdistribution",
  },
]
const masterreport: { title: string; href: string }[] = [
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
     {
    title: "Update TL",
    href: "/tetformgeneratefortl",
  },
      {
    title: "Total Head Count",
    href: "/headcount",
  },
      {
    title: "Training Hours",
    href: "/totrainhrs",
  },
]
const trainingcertificates: { title: string; href: string }[] = [
  {
    title: "Upload Certificates",
    href: "/uploadcer",
  },
    {
    title: "Upload Materials",
    href: "/uploadmaterials",
  },
]
// const trainingmaterials: { title: string; href: string }[] = [
//   {
//     title: "Upload Materials",
//     href: "/uploadmaterials",
//   },
// ]

export default function NavigationMenuDemo() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
const [department, setDepartment] = useState('');
const [username, setUsername] = useState('');
const [employeeId, setEmployeeId] = useState('');
const [accessRole, setAccessRole] = useState<string | null>(null);
const [isAuthorized, setIsAuthorized] = useState<null | boolean>(null);

console.log("Navbar accessRole (raw): '" + accessRole + "'");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };
 
  useEffect(() => {
  const storedEmployeeId = localStorage.getItem('employeeId');
   const storedDepartment = localStorage.getItem("department");
  if (storedEmployeeId && storedDepartment) {
    setEmployeeId(storedEmployeeId);
    setDepartment(storedDepartment);
  } else {
    window.location.href = '/';
    return;
  }

  const fetchAccessRole = async () => {
    try {
      const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
      const data = await res.json();
      if (res.ok && data.Access_Role ) {
        setAccessRole(data.Access_Role);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Error fetching access role:', error);
      setIsAuthorized(false);
    }
  };

  fetchAccessRole();
}, []);

  useEffect(() => {
    // Retrieve the department, username, and employeeId from localStorage
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');

    // If data is found, update state
    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      setUsername(storedUsername);
      setEmployeeId(storedEmployeeId);
    } else {
      // If no data found, redirect to login page
      window.location.href = '/';
    }
    // Removed fetchData and trainingData usage as trainingData state is unused
  }, [department, username, employeeId]);
 if (isAuthorized === null) return null;

  // 🔒 Unauthorized view
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
      <nav className="flex items-center z-10  bg-gray-100 justify-between p-2" >
        {/* Brand Name on the Left */} 
        <div className="text-black font-semibold text-xl">
        <Link href="/dashboard"> Greentech Industries</Link> 
        </div>
       

        {/* Hamburger Icon for Mobile */}
        {/* Hamburger Icon and Profile Icon aligned to the Right */}
        <div className="md:hidden flex items-center space-x-4 ml-auto">
          <button onClick={toggleMenu} className="text-black cursor-pointer">
            {isMenuOpen ? (
              <X className="h-6 w-6 cursor-pointer" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation Menu for Desktop and Toggleable for Mobile */}
        <NavigationMenu className="mx-10">
        <NavigationMenuList
          className={cn(
            "flex space-x-4 overflow-hidden",
            isMenuOpen ? "flex-col mt-4 space-y-2 md:flex-row md:mt-0 md:space-y-0" : "hidden md:flex"
          )}
        >
      
          <NavigationMenuItem className="bg-gray-100 cursor-pointer">
  <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer">Training Calendar</NavigationMenuTrigger>
  <NavigationMenuContent className="grid gap-2 p-1 md:w-[280px] max-h-[280px] cursor-pointer">
    <ul className="grid gap-2 cursor-pointer">
   {training.map((component) => {
  if (component.title === "Requirement - IATF/HSE" && accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HR_Res" ) {
      return null; // skip if not Employee or HOS
  }
 if (component.title === "Approval Form" && accessRole !== "HOS" && accessRole !== "HOD") {
      return null; 
  }
 if (component.title === "Approval Form " && accessRole !== "HR_Res" && accessRole !== "HR_Hod" ) {
      return null; 
  }

  return (
    <ListItem key={component.title} title={component.title} href={component.href} />
  );
})}
    </ul>
  </NavigationMenuContent>
</NavigationMenuItem>

{accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && (
<NavigationMenuItem className="bg-gray-100 cursor-pointer" >
              <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer" >Transaction</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[250px] px-3 max-h-[300px] ">
                <ul className="grid gap-2 p-1">
                  {transaction.map((component) => {
                     if (component.title === "Training Attendance Entry" && accessRole !== "HOS" && accessRole !== "HOD" && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                     return null; // skip if not Employee or HOS
                  }

                    if (component.title === "Monthly Training Particulars" && accessRole !== "HOS" && accessRole !== "HOD" && accessRole !== "HR_Res" && accessRole !== "HR_Hod" ) {
                    return null; 
                 }
                         if (component.title === "Temporary to regular" && accessRole !== "HOS" && accessRole !== "HOD"  && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                    return null; 
                 }
                 
          return(
                    <ListItem key={component.title} title={component.title} href={component.href} />
          );
})}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            )}
{accessRole !== "Res_Person" && (
<NavigationMenuItem className="bg-gray-100 cursor-pointer">
              <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer">Training Effectiveness</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[300px] ">
                <ul className="grid gap-2 p-1">
                  {tet.map((component) => {
                        if (component.title === "Generate TEE Forms" && accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" && accessRole !== "HR_Res"  && accessRole !== "HR_Hod") {
                    return null; 
                    
                 }
                    if (component.title === "Generic Forms"  && accessRole !== "HR_Res"  && accessRole !== "HR_Hod") {
                    return null; 
                    
                 }
          return(
                    <ListItem key={component.title} title={component.title} href={component.href} />
          );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
)}
       
          {/* <NavigationMenuItem>
            <NavigationMenuTrigger>Training Agencies</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-1 p-1 md:w-[500px] md:grid-cols lg:w-[300px]">
                {trainingagencies.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
          {accessRole !== "Res_Person" && accessRole !== "HOS"  && accessRole !== "HOD" &&(
          <NavigationMenuItem className="bg-gray-100 cursor-pointer">
            <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer">Upload </NavigationMenuTrigger>
            <NavigationMenuContent
              className="overflow-hidden"
              style={{ "--radix-navigation-menu-viewport-height": "auto" } as React.CSSProperties}
            >
              <ul className="grid w-[150px] gap-1 p-1 md:w-[200px] md:grid-cols lg:w-[200px]">
                {trainingcertificates.map((component) => {
                     if (component.title === "Upload Certificates" && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                    return null; 
                    
                 }  if (component.title === "Upload Materials" && accessRole !== "HR_Res" && accessRole !== "HR_Hod") {
                    return null; 
                    
                 }
                 
          return(
                    <ListItem key={component.title} title={component.title} href={component.href} />
          );
})}

              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          )}
          {/* {accessRole !== "Res_Person" && accessRole !== "HOS" && accessRole !== "HOD" &&(
          <NavigationMenuItem className="bg-gray-100 cursor-pointer">
            <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer">Training Materials</NavigationMenuTrigger>
            <NavigationMenuContent
              className="overflow-hidden"
              style={{ "--radix-navigation-menu-viewport-height": "auto" } as React.CSSProperties}
            >
              <ul className="grid w-[100px] gap-1 p-1 md:w-[200px] md:grid-cols lg:w-[200px] ">
                {trainingmaterials.map((component) =>  {
                     if (component.title === "Upload Materials" && accessRole !== "HR_Res" && accessRole !== "HR_Hod" ) {
                    return null; 
                 }
                 
          return(
                    <ListItem key={component.title} title={component.title} href={component.href} />
          );
})}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          )} */}
{(accessRole === "Res_Person" || accessRole === "HR_Res" || accessRole ==="HR_Hod" || accessRole === "HOS" || accessRole === "HOD") && !(accessRole === "Res_Person" && (department !== "MS" && department !== "FNTRY")) && (
            <NavigationMenuItem className="bg-gray-100 cursor-pointer">
              <NavigationMenuTrigger className="hover:text-sky-400 cursor-pointer">T & D Report</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[400px] ">
                <ul className="grid gap-2 p-1 cursor-pointer">
                  {masterreport.map((component) => {
                    console.log("Rendering masterreport item:", component.title, "accessRole:", accessRole);
                    if (component.title === "Employee History" && accessRole !== "HR_Res" ) {
                      console.log("Skipping Employee History for accessRole:", accessRole);
                      return null; // skip if not Employee or HOS
                    }
                    if (component.title === "Qualified Trainers List" && accessRole !== "HR_Res" && accessRole !== "HR_Hod" && accessRole !== "HOS" && accessRole !== "HOD") {
                      console.log("Skipping Qualified Trainers List for accessRole:", accessRole);
                      return null; 
                    }
                    if (component.title === "Training Cost/Budget" && accessRole !== "HR_Res" ) {
                      console.log("Skipping Training Cost/Budget for accessRole:", accessRole);
                      return null; 
                    }
                    if (component.title === "Training Agencies" && accessRole !== "HR_Res" ) {
                      console.log("Skipping Training Agencies for accessRole:", accessRole);
                      return null; 
                    }
                    const normalizedAccessRole = accessRole ? accessRole.trim().toUpperCase() : "";

                    if (component.title === "Add Training Record" && normalizedAccessRole !== "HR_RES"  ) {
                      console.log("Skipping Add Training Record for accessRole:", accessRole);
                      return null; // skip
                    }
                          if (component.title === "Total Head Count" && normalizedAccessRole !== "HR_RES" && normalizedAccessRole !== "HR_HOD"  ) {
                      console.log("Skipping Add Training Record for accessRole:", accessRole);
                      return null; // skip
                    }
                          if (component.title === "Training Hours" && normalizedAccessRole !== "HR_RES" && normalizedAccessRole !== "HR_HOD" ) {
                      console.log("Skipping Add Training Record for accessRole:", accessRole);
                      return null; // skip
                    }
// if (component.title === "Update TL" && (accessRole !== "Res_Person" || (department !== "MS" && department !== "FNTRY"))) {
//                       console.log("Skipping Update TL for accessRole or department:", accessRole, department);
//                       return null; // skip
//                     }
                    return(
                      <ListItem key={component.title} title={component.title} href={component.href} />
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            )}
          <NavigationMenuItem className="bg-gray-100 hover:bg-gray-200 hover:text-sky-400 focus:bg-gray-300 transition-all cursor-pointer duration-300">
            <div className="mx-5 cursor-pointer">  <ProfileDropdown   username={username} /></div>
        
            </NavigationMenuItem>

          </NavigationMenuList>

        </NavigationMenu>

        {isOpen && (
  <div className="md:hidden max-h-[80vh]  px-4 pt-2 pb-4 space-y-4 bg-background border-t animate-slide-in-left">
    {/* Training Group */}
    <MobileNavGroup title="Training" isOpen={openGroup === "training"} toggle={() => toggleGroup("training")}>
      {training.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup>

    {/* Transaction Group */}
    <MobileNavGroup title="Transaction" isOpen={openGroup === "transaction"} toggle={() => toggleGroup("transaction")}>
      {transaction.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup>

    {/* TET Group */}
    <MobileNavGroup title="TET" isOpen={openGroup === "tet"} toggle={() => toggleGroup("tet")}>
      {tet.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup>

    {/* Master Report Group */}
    <MobileNavGroup title="Master Report" isOpen={openGroup === "masterreport"} toggle={() => toggleGroup("masterreport")}>
      {masterreport.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup>

    {/* Training Agencies Group
    <MobileNavGroup title="Training Agencies" isOpen={openGroup === "trainingagencies"} toggle={() => toggleGroup("trainingagencies")}>
      {trainingagencies.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup> */}

    {/* Training Certificates Group */}
    <MobileNavGroup title="Training Certificates" isOpen={openGroup === "trainingcertificates"} toggle={() => toggleGroup("trainingcertificates")}>
      {trainingcertificates.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup>

    {/* Training Materials Group */}
    {/* <MobileNavGroup title="Training Materials" isOpen={openGroup === "trainingmaterials"} toggle={() => toggleGroup("trainingmaterials")}>
      {trainingmaterials.map((item) => (
        <MobileNavLink key={item.title} href={item.href}>
          {item.title}
        </MobileNavLink>
      ))}
    </MobileNavGroup> */}
  </div>
)}

      </nav>
    </div>
  )
}
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-4 py-3 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
      {children}
    </Link>
  );
}

function MobileNavGroup({ title, children, isOpen, toggle }: { title: string; children: React.ReactNode; isOpen: boolean; toggle: () => void }) {
  return (
    <div>
      <button onClick={toggle} className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] mt-1 space-y-1' : 'max-h-0'} px-2`}>
        {isOpen && children}
      </div>
    </div>
  );
}
function ProfileDropdown({ username }: { username: string }) {
  
  const router = useRouter();
  const handleLogout = () => {
  
    // Remove the Logged data from localStorage
    localStorage.removeItem('isLoggedIn');
    // Redirect to the login page
    router.push('/');
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <User className="h-5 w-5 cursor-pointer"  />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2">
        <DropdownMenuLabel className="text-center text-xl font-bold">{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem><a href="/dashboard">Dashboard</a></DropdownMenuItem> 
        </DropdownMenuGroup>
        <DropdownMenuItem><button type="button" className="px-6 mt-2 py-2 text-sm cursor-pointer font-semibold text-white bg-gray-600 rounded-md shadow-md hover:bg-gray-900 focus:ring-2 focus:ring-black-600 focus:ring-offset-2 " onClick={handleLogout}>Logout</button></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block px-4 py-3 rounded-md text-sm font-medium text-black hover:text-sky-400 hover:bg-gray-100",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-black">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  }
)

ListItem.displayName = "ListItem"
