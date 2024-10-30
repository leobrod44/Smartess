"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectComponent from "../components/ProjectComponent";
import DashboardWidget from "../components/DashboardComponents/DashboardWidget";
import Searchbar from "../components/Searchbar";
import FilterComponent from "../components/FilterList";

// Mock data for projects
const MOCK_PROJECTS = [
  {
    projectId: "a10294",
    address: "1000 De La Gauchetiere",
    adminUsers: 1,
    hubUsers: 6,
    pendingTickets: 4,
    units: [
      { unitNumber: "101" },
      { unitNumber: "102" },
      { unitNumber: "103" },
    ],
  },
  {
    projectId: "b10294",
    address: "750 Peel Street",
    adminUsers: 2,
    hubUsers: 12,
    pendingTickets: 5,
    units: [{ unitNumber: "201" }, { unitNumber: "202" }],
  },
  {
    projectId: "c10294",
    address: "1500 Maisonneuve Blvd",
    adminUsers: 1,
    hubUsers: 8,
    pendingTickets: 3,
    units: [
      { unitNumber: "301" },
      { unitNumber: "302" },
      { unitNumber: "303" },
      { unitNumber: "304" },
    ],
  },
];

const DashboardPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState(MOCK_PROJECTS); // replace [...] with actual project data
  const [filteredProjects, setFilteredProjects] = useState(MOCK_PROJECTS);

  const filterOptionsPage1 = [
    "Address A-Z",
    "Most Units",
    "Least Units",
    "Most Hub Users",
    "Least Hub Users",
    "Most Pending Tickets",
    "Least Pending Tickets",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
    }
  }, [router]);

  const handleSearch = (query: string) => {
    // Update filteredProjects based on the search query
    const filtered = projects.filter((project) =>
      project.address.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const handleFilterChange = (filterValue: string) => {
    let newFilteredProjects = [...projects]; // Start with all projects

    switch (filterValue) {
      case "Address A-Z":
        newFilteredProjects.sort((a, b) => a.address.localeCompare(b.address));
        break;
      case "Most Units":
        newFilteredProjects.sort((a, b) => b.units.length - a.units.length);
        break;
      case "Least Units":
        newFilteredProjects.sort((a, b) => a.units.length - b.units.length);
        break;
      case "Most Hub Users":
        newFilteredProjects.sort((a, b) => b.hubUsers - a.hubUsers);
        break;
      case "Least Hub Users":
        newFilteredProjects.sort((a, b) => a.hubUsers - b.hubUsers);
        break;
      case "Most Pending Tickets":
        newFilteredProjects.sort((a, b) => b.pendingTickets - a.pendingTickets);
        break;
      case "Least Pending Tickets":
        newFilteredProjects.sort((a, b) => a.pendingTickets - b.pendingTickets);
        break;
      default:
        break;
    }

    setFilteredProjects(newFilteredProjects);
  };

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-4">
        Welcome to Your Dashboard
      </div>
      <DashboardWidget />

      <div className="flex items-center pt-4 justify-between">
        <div className=" pt-4 w-[306px] h-[66px] text-[#325a67] text-[30px]  leading-10 tracking-tight">
          Your Projects
        </div>
        <div className="flex items-center pt-2">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsPage1}
          />
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <ProjectComponent projects={filteredProjects} />
    </div>
  );
};

export default DashboardPage;
