"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
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
  // {
  //   title: "view / edit / upload",
  //   href: "/vieweditupload",
  // },
  {
    title: "Training Record - IATF/HSE",
    href: "/trainingrecord",
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
  {
    title: "Temporary to regular",
    href: "/temptoreg",
  },
]

const tet: { title: string; href: string }[] = [
  {
    title: "TET forms Generate",
    href: "tetformsgenerate",
  },
  // {
  //   title: "TET Reports",
  //   href: "tetreports",
  // },
]
const masterreport: { title: string; href: string }[] = [
  {
    title: "Employee History",
    href: "/emphistory",
  },
  // {
  //   title: "Monthly Training Particulars",
  //   href: "/montrainpar",
  // },
  // {
  //   title: "Total Training Hrs",
  //   href: "/tottrainhrs",
  // },
  // {
  //   title: "Dept wise Training Hrs",
  //   href: "/deptwisetrainhrs",
  // },
  // {
  //   title: "HSE Head Count",
  //   href: "/hseheadcount",
  // },
  // {
  //   title: "HSE Teams List Forklift, Boom Lift, First Aid, ERT, SCBA & Work Permit Issuers",
  //   href: "/hseteams",
  // },
  // {
  //   title: "Training Attendance Mail to HOD's Every 3 months",
  //   href: "/trainingattendancetohod",
  // },
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
  
]
// const trainingagencies: { title: string; href: string }[] = [
//   {
//     title: "Upload External Training Agency details",
//     href: "/uploadexternal",
//   },
//   // {
//   //   title:"List of External Training Agencies",
//   //   href: "/listofexternal",
//   // },
// ]
const trainingcertificates: { title: string; href: string }[] = [
  {
    title: "Upload Certificates",
    href: "/uploadcer",
  },
  {
    title: "View Certificates",
    href: "/viewcer",
  },
]
const trainingmaterials: { title: string; href: string }[] = [
  {
    title: "Upload Materials",
    href: "/uploadmaterials",
  },
  // {
  //   title: "View Materials",
  //   href: "/viewmaterials",
  // },
]

export default function NavigationMenuDemo() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // const router = useRouter();
  // const handleLogout = () => {
  
  //   // Remove the Logged data from localStorage
  //   localStorage.removeItem('isLoggedIn');
    
  //   // Redirect to the login page
  //   router.push('/');
  // };
  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };
 
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          <ProfileDropdown />
        </div>

        {/* Navigation Menu for Desktop and Toggleable for Mobile */}
        <NavigationMenu>
        <NavigationMenuList
          className={cn(
            "flex space-x-4 overflow-hidden",
            isMenuOpen ? "flex-col mt-4 space-y-2 md:flex-row md:mt-0 md:space-y-0" : "hidden md:flex"
          )}
        >
<NavigationMenuItem className="bg-gray-100 Z-10">
  <NavigationMenuTrigger className="hover:text-sky-400">Training Calendar</NavigationMenuTrigger>
  <NavigationMenuContent className="grid gap-2 p-1 md:w-[300px] max-h-[300px]">
    <ul className="grid gap-2 ">
      {training.map((component) => (
        <ListItem key={component.title} title={component.title} href={component.href} />
      ))}
    </ul>
  </NavigationMenuContent>
</NavigationMenuItem>

<NavigationMenuItem className="bg-gray-100">
              <NavigationMenuTrigger className="hover:text-sky-400" >Transaction</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[250px] px-3 max-h-[300px] ">
                <ul className="grid gap-2 p-1">
                  {transaction.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
<NavigationMenuItem className="bg-gray-100">
              <NavigationMenuTrigger className="hover:text-sky-400">TET</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[300px] ">
                <ul className="grid gap-2 p-1">
                  {tet.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="bg-gray-100">
              <NavigationMenuTrigger className="hover:text-sky-400">Master Report</NavigationMenuTrigger>
              <NavigationMenuContent className="grid gap-2 p-1 md:w-[200px] max-h-[300px] ">
                <ul className="grid gap-2 p-1">
                  {masterreport.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
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
          <NavigationMenuItem className="bg-gray-100">
            <NavigationMenuTrigger className="hover:text-sky-400">Training certificates</NavigationMenuTrigger>
            <NavigationMenuContent
              className="overflow-hidden"
              style={{ "--radix-navigation-menu-viewport-height": "auto" } as React.CSSProperties}
            >
              <ul className="grid w-[150px] gap-1 p-1 md:w-[200px] md:grid-cols lg:w-[200px]">
                {trainingcertificates.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem className="bg-gray-100 hover:bg-gray-200 hover:text-sky-400 focus:bg-gray-300 transition-all duration-300">
            <NavigationMenuTrigger className="hover:text-sky-400">Training Materials</NavigationMenuTrigger>
            <NavigationMenuContent
              className="overflow-hidden"
              style={{ "--radix-navigation-menu-viewport-height": "auto" } as React.CSSProperties}
            >
              <ul className="grid w-[100px] gap-1 p-1 md:w-[150px] md:grid-cols lg:w-[150px] ">
                {trainingmaterials.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="bg-gray-100 hover:bg-gray-200 hover:text-sky-400 focus:bg-gray-300 transition-all duration-300">
            <ProfileDropdown/>
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
    <MobileNavGroup title="Training Materials" isOpen={openGroup === "trainingmaterials"} toggle={() => toggleGroup("trainingmaterials")}>
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
function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-center">John Doe || Unknown</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
          <DropdownMenuItem>Account</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Login</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
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
              "block px-4 py-3 rounded-md text-sm font-medium text-black hover:text-sky-400 hover:bg-muted",
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


