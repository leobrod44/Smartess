"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectComponent from "../components/ProjectComponent";
import DashboardWidget from "../components/DashboardComponents/DashboardWidget";
import Searchbar from "../components/Searchbar";
import FilterComponent from "../components/FilterList";
import { Project } from "../mockData";
import { projectApi } from "@/api/page";
import { useProjectContext } from "@/context/ProjectProvider";

const DashboardPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedProjectId } = useProjectContext();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-[#14323B] text-lg">Loading projects...</div>
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
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-4">
        Welcome to Your Dashboard
      </div>
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
      <ProjectComponent projects={filteredProjects} />
    </div>
  );
};

export default DashboardPage;
