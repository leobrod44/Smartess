"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import dashboardLogo from "@/public/images/dashboardLogo.png";
import Image from "next/image";
import Link from "next/link";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import { authApi } from "@/api/components/DashboardNavbar";

// Material UI icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DoorBackOutlinedIcon from "@mui/icons-material/DoorBackOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { usePathname, useRouter } from "next/navigation";
import AddressDropdown from "./DashboardComponents/AddressDropdown";
import { useProjectContext } from "@/context/ProjectProvider";
import { projectApi } from "@/api/page";
import { Project } from "../mockData";
import { useUserContext } from "@/context/UserProvider";
import Notification from "./notifications/notification";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

// Sidebar Elements
const home = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardOutlinedIcon,
  },
];

const general = [
  {
    name: "Units",
    href: "/dashboard/unit",
    icon: DoorBackOutlinedIcon,
  },
  {
    name: "Tickets",
    href: "/dashboard/ticket",
    icon: ConfirmationNumberOutlinedIcon,
  },
  {
    name: "Consumption",
    href: "/dashboard/consumption",
    icon: ElectricBoltOutlinedIcon,
  },
  {
    name: "Alerts",
    href: "/dashboard/alerts",
    icon: ConfirmationNumberOutlinedIcon,
  },
];

const security = [
  {
    name: "Surveillance",
    href: "/dashboard/surveillance",
    icon: VideocamOutlinedIcon,
  },
];

const community = [
  {
    name: "Annoucements",
    href: "/dashboard/announcement",
    icon: AnnouncementOutlinedIcon,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: ChatBubbleOutlineOutlinedIcon,
  },
  {
    name: "Manage Accounts",
    href: "/dashboard/manage-accounts",
    icon: PeopleAltOutlinedIcon,
  },
];

const userNavigation = [
  { name: "My Dashboard", href: "/dashboard", icon: DashboardOutlinedIcon },
  { name: "My Profile", href: "/dashboard/profile", icon: Person2OutlinedIcon },
  {
    name: "My Tickets",
    href: "/dashboard/ticket/my-tickets",
    icon: ConfirmationNumberOutlinedIcon,
  },
  { name: "Sign Out", href: "/", icon: LogoutOutlinedIcon },
];

function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const DashboardNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setSelectedProjectId, setSelectedProjectAddress } =
    useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SidebarItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const {
    userFirstName,
    userLastName,
    setUserId,
    setUserEmail,
    setUserFirstName,
    setUserLastName,
    setUserType,
    setUserProfilePicture,
    setUserPhoneNumber,
  } = useUserContext();

  const [token, setToken] = useState<string | null>(null);

  const sidebarItems = [...home, ...general, ...security, ...community];

  const handleProjectChange = (projectId: string, projectAddress: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectAddress(projectAddress);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      const matches = sidebarItems.filter((item) =>
        item.name.toLowerCase().startsWith(query.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (href: string) => {
    router.push(href);
    setSuggestions([]);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          router.push("/sign-in");
          return;
        }
        // Update the token state so that it can be passed to Notification
        setToken(storedToken);
        const response = await projectApi.getUserProjects(storedToken);
        setProjects(response.projects);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem("token");
      setUserId("");
      setUserEmail("");
      setUserFirstName("");
      setUserLastName("");
      setUserType("");
      setUserProfilePicture("");
      setUserPhoneNumber("");
      setToken("");
      showToastSuccess("Logged out successfully");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      showToastError(
        error instanceof Error
          ? error.message
          : "An error occurred during logout"
      );
    }
  };

  return (
    <>
      <Toast />
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition show={sidebarOpen}>
          <Dialog
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <TransitionChild
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <TransitionChild
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </TransitionChild>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#254752] px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <Link href="/">
                        <Image
                          className="h-8 w-auto"
                          src={dashboardLogo}
                          alt="Logo"
                          width={100}
                          height={40}
                        />
                      </Link>
                    </div>

                    <div>
                      <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                        PROJECT FILTER
                      </div>
                      {/* Address Dropdown */}
                      <AddressDropdown
                        projects={projects}
                        onProjectChange={handleProjectChange}
                      />
                    </div>

                    <nav className="flex flex-1 flex-col">
                      <ul
                        role="list"
                        className="flex flex-1 flex-col gap-y-7"
                      >
                        <li>
                          <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                            HOME
                          </div>
                          <ul
                            role="list"
                            className="-mx-2 mt-2 space-y-1"
                          >
                            {home.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    pathname === item.href
                                      ? "bg-[#14323B]"
                                      : "hover:bg-[#14323B]",
                                    "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                                  )}
                                >
                                  <item.icon
                                    className="text-white"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                            GENERAL
                          </div>
                          <ul
                            role="list"
                            className="-mx-2 mt-2 space-y-1"
                          >
                            {general.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    pathname === item.href
                                      ? "bg-[#14323B]"
                                      : "hover:bg-[#14323B]",
                                    "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                                  )}
                                >
                                  <item.icon
                                    className="text-white"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                            SECURITY
                          </div>
                          <ul
                            role="list"
                            className="-mx-2 mt-2 space-y-1"
                          >
                            {security.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    pathname === item.href
                                      ? "bg-[#14323B]"
                                      : "hover:bg-[#14323B]",
                                    "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                                  )}
                                >
                                  <item.icon
                                    className="text-white"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                            COMMUNITY
                          </div>
                          <ul
                            role="list"
                            className="-mx-2 mt-2 space-y-1"
                          >
                            {community.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    pathname === item.href
                                      ? "bg-[#14323B]"
                                      : "hover:bg-[#14323B]",
                                    "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                                  )}
                                >
                                  <item.icon
                                    className="text-white"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#254752] px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/">
                <Image
                  className="h-8 w-auto"
                  src={dashboardLogo}
                  alt="Logo"
                  width={100}
                  height={40}
                />
              </Link>
            </div>
            <div>
              <div className="text-xs font-semibold leading-6 text-[#7A8C92]">
                PROJECT FILTER
              </div>
              {/* Address Dropdown */}
              <AddressDropdown
                projects={projects}
                onProjectChange={handleProjectChange}
              />
            </div>

            <nav className="flex flex-1 flex-col">
              <ul
                role="list"
                className="flex flex-1 flex-col gap-y-7"
              >
                <li>
                  <div className="text-xs font-semibold leading-6 text-[#7A8C92] mt-5">
                    HOME
                  </div>
                  <ul
                    role="list"
                    className="-mx-2 mt-2 space-y-1"
                  >
                    {home.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            pathname === item.href
                              ? "bg-[#14323B]"
                              : "hover:bg-[#14323B]",
                            "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                          )}
                        >
                          <item.icon
                            className="text-white"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-[#7A8C92] mt-2">
                    GENERAL
                  </div>
                  <ul
                    role="list"
                    className="-mx-2 mt-2 space-y-1"
                  >
                    {general.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            pathname === item.href
                              ? "bg-[#14323B]"
                              : "hover:bg-[#14323B]",
                            "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                          )}
                        >
                          <item.icon
                            className="text-white"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-[#7A8C92] mt-2">
                    SECURITY
                  </div>
                  <ul
                    role="list"
                    className="-mx-2 mt-2 space-y-1"
                  >
                    {security.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            pathname === item.href
                              ? "bg-[#14323B]"
                              : "hover:bg-[#14323B]",
                            "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                          )}
                        >
                          <item.icon
                            className="text-white"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs font-semibold leading-6 text-[#7A8C92] mt-2">
                    COMMUNITY
                  </div>
                  <ul
                    role="list"
                    className="-mx-2 mt-2 space-y-1"
                  >
                    {community.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            pathname === item.href
                              ? "bg-[#14323B]"
                              : "hover:bg-[#14323B]",
                            "text-white group flex gap-x-3 rounded-full p-2 text-xs leading-6"
                          )}
                        >
                          <item.icon
                            className="text-white"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon
                className="h-6 w-6"
                aria-hidden="true"
              />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form
                className="relative flex flex-1"
                onSubmit={(e) => e.preventDefault()}
              >
                <label
                  htmlFor="search-field"
                  className="sr-only"
                >
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {/* Suggestions list */}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white shadow-lg ring-1 ring-black ring-opacity-5 rounded-md focus:outline-none">
                    {suggestions.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => handleSuggestionClick(item.href)}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Separator */}
                <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                  aria-hidden="true"
                />

                {token && <Notification token={token} />}
                {/* Profile dropdown */}
                <Menu
                  as="div"
                  className="relative"
                >
                  <MenuButton className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <Image
                      className="h-8 w-8 rounded-full bg-gray-50"
                      src={dashboardLogo}
                      alt=""
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                        aria-hidden="true"
                      >
                        {userFirstName
                          ? `${userFirstName} ${userLastName}`
                          : "Loading..."}
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </MenuButton>
                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      <div className="flex items-center justify-center text-xs py-2">
                        Hello {userFirstName ? userFirstName : "User"}!
                      </div>
                      <div className="border-b border-gray-300"></div>
                      {userNavigation.map((item) =>
                        item.name === "Sign Out" ? (
                          <MenuItem key={item.name}>
                            {({ focus }) => (
                              <button
                                onClick={handleLogout}
                                className={classNames(
                                  focus ? "bg-gray-50" : "",
                                  "flex w-full items-center px-3 py-1 text-sm leading-6 text-[#325A67]"
                                )}
                              >
                                <item.icon className="mr-2" />
                                {item.name}
                              </button>
                            )}
                          </MenuItem>
                        ) : (
                          <MenuItem key={item.name}>
                            {({ focus }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  focus ? "bg-gray-50" : "",
                                  "flex items-center px-3 py-1 text-sm leading-6 text-[#325A67]"
                                )}
                              >
                                <span className="mr-2">
                                  <item.icon />
                                </span>
                                {item.name}
                              </Link>
                            )}
                          </MenuItem>
                        )
                      )}
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main>
            <div className="px-4 sm:px-6 lg:px-8">{/* Your content */}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardNavbar;
