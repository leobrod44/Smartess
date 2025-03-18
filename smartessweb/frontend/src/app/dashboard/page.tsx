"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectComponent from "../components/DashboardComponents/ProjectComponent";
import DashboardWidget from "../components/DashboardComponents/DashboardWidget";
import Searchbar from "../components/Searchbar";
import FilterComponent from "../components/FilterList";
import { Project } from "../mockData";
import { projectApi } from "@/api/page";
import { useProjectContext } from "@/context/ProjectProvider";
import NoResultsFound from "../components/NoResultsFound";

const DashboardPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedProjectId } = useProjectContext();
  const [query, setQuery] = useState("");

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
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await projectApi.getUserProjects(token);
        const fetchedProjects = response.projects;

        const filteredBySelectedId = selectedProjectId
          ? fetchedProjects.filter(
              (project) => project.projectId === selectedProjectId
            )
          : fetchedProjects;

        setProjects(fetchedProjects);
        setFilteredProjects(filteredBySelectedId);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router, selectedProjectId]);

  const handleSearch = (query: string) => {
    const relevantProjects = selectedProjectId
      ? projects.filter((project) => project.projectId === selectedProjectId)
      : projects;

    const filtered = relevantProjects.filter((project) => {
      const addressMatch = project.address
        .toLowerCase()
        .includes(query.toLowerCase());
      const userMatch = project.units.some((unit) =>
        unit.hubUsers.some((user) =>
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
    setQuery(query);
  };

  const handleFilterChange = (filterValue: string) => {
    const newFilteredProjects = [...filteredProjects];

    switch (filterValue) {
      case "Address A-Z":
        newFilteredProjects.sort((a, b) => a.address.localeCompare(b.address));
        break;
      case "Most Units":
        newFilteredProjects.sort((a, b) => b.units.length - a.units.length);
        break;
      case "Most Hub Users":
        newFilteredProjects.sort((a, b) => b.hubUsersCount - a.hubUsersCount);
        break;
      case "Most Pending Tickets":
        newFilteredProjects.sort(
          (a, b) => b.pendingTicketsCount - a.pendingTicketsCount
        );
        break;
      default:
        break;
    }
    setFilteredProjects(newFilteredProjects);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-4 lg:mx-8  min-h-screen flex flex-col">
      <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
        Welcome to Your Dashboard
      </div>
      <h2 className=" text-left text-[#325a67] text-[16px] leading-10 tracking-tight pb-4">
        View and manage information about your organization&apos;s overall
        health, and the projects within it.
      </h2>
      <DashboardWidget />

      <div className="flex items-center pt-4 justify-between">
        <div className="pt-4 w-[306px] h-[66px] text-[#325a67] text-[30px] leading-10 tracking-tight">
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
      <h2 className="text-left text-[#14323B] text-[16px] leading-2 tracking-tight pb-4">
        {" "}
        <span className="text-[#325a67] font-bold"> TIP:</span> Use the Project
        Filter on the left, or the search bar and filter above to narrow
        results.
      </h2>
      {projects.length === 0 ? (
        <p>No data available</p>
      ) : filteredProjects.length === 0 ? (
        <NoResultsFound searchItem={query} />
      ) : (
        <ProjectComponent projects={filteredProjects} />
      )}
    </div>
  );
};

export default DashboardPage;
