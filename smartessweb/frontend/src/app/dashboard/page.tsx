"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectComponent from "../components/ProjectComponent";
import DashboardWidget from "../components/DashboardComponents/DashboardWidget";
import Searchbar from "../components/Searchbar";
import FilterComponent from "../components/FilterList";
import { generateMockProjects, Project } from "../mockData";

const DashboardPage = () => {
  const router = useRouter();
  const [projects] = useState<Project[]>(generateMockProjects());
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  /**
   * These filter options will change on every page, based on the data being displayed
   */
  const filterOptionsDashboard = [
    "Address A-Z",
    "Most Units",
    "Most Hub Users",
    "Most Pending Tickets",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
    }
  }, [router]);

  /**
   * Function takes a query string and checks if there is a matching address, hub owner, or hub user name.
   * If so, it filters the PROJECT that contains that matching query and displays it
   * @param query
   */
  const handleSearch = (query: string) => {
    // Update filteredProjects based on the search query
    const filtered = projects.filter((project) => {
      const addressMatch = project.address
        .toLowerCase()
        .includes(query.toLowerCase());

      const userMatch = project.units.some((unit) =>
        unit.users.some((user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
      );

      const ownerMatch = project.units.some((unit) =>
        `${unit.owner.firstName} ${unit.owner.lastName}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      return addressMatch || userMatch || ownerMatch;
    });

    setFilteredProjects(filtered);
  };

  /**
   * Function to determine which filter value was selected and sort the projects in the correct
   * order based on that filter.
   * @param filterValue
   */
  const handleFilterChange = (filterValue: string) => {
    const newFilteredProjects = [...projects]; // Start with all projects

    switch (filterValue) {
      case "Address A-Z":
        newFilteredProjects.sort((a, b) => a.address.localeCompare(b.address));
        break;
      case "Most Units":
        newFilteredProjects.sort((a, b) => b.units.length - a.units.length);
        break;
      case "Most Hub Users":
        newFilteredProjects.sort((a, b) => b.hubUsers - a.hubUsers);
        break;
      case "Most Pending Tickets":
        newFilteredProjects.sort((a, b) => b.pendingTickets - a.pendingTickets);
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
            filterOptions={filterOptionsDashboard}
          />
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <ProjectComponent projects={filteredProjects} />
    </div>
  );
};

export default DashboardPage;
