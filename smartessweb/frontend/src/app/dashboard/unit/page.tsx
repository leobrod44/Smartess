"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import UnitComponent from "@/app/components/UnitListComponent";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { Pagination } from "@mui/material";
import { useState, useEffect } from "react";
import { Project } from "../../mockData";
import { unitsApi } from "@/api/page";
import { useRouter } from "next/navigation";
import NoResultsFound from "@/app/components/NoResultsFound";
const unitsPerPage = 3;

const UnitPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const { selectedProjectAddress } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const filterOptionsUnits = ["Most Pending Tickets"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const responseProjects = await unitsApi.getUserProjects(token);
      const fetchedProjects = responseProjects.projects;
      setProjects(fetchedProjects);
      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  // Mapping Units to components with Mock Data
  const allUnits = projects.flatMap((project) =>
    project.units.map((unit) => ({
      ...unit,
      projectAddress: project.address,
      pendingTickets: unit.tickets.pending,
    }))
  );

  // Filtering and Sorting
  const filteredUnitsByProject = allUnits
    .filter((unit) => {
      const effectiveProjectAddress = selectedProjectAddress || "ALL PROJECTS";

      const matchesProjectAddress =
        effectiveProjectAddress === "ALL PROJECTS"
          ? true
          : unit.projectAddress === effectiveProjectAddress;

      const matchesSearchQuery =
        effectiveProjectAddress === "ALL PROJECTS"
          ? unit.projectAddress
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            `${unit.owner.firstName} ${unit.owner.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.owner.email
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.hubUsers.some((user) =>
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            String(unit.unitNumber)
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : `${unit.owner.firstName} ${unit.owner.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.owner.email
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.hubUsers.some((user) =>
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            String(unit.unitNumber)
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

      return matchesProjectAddress && matchesSearchQuery;
    })
    .sort((a, b) => {
      if (filter === "Most Pending Tickets") {
        return Number(b.pendingTickets) - Number(a.pendingTickets);
      }
      return 0; // Default case - no sorting
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredUnitsByProject.length / unitsPerPage);
  const currentUnits =
    filteredUnitsByProject.length === 0
      ? [] // Reset to an empty array if no filtered units exist
      : filteredUnitsByProject.slice(
          (currentPage - 1) * unitsPerPage,
          currentPage * unitsPerPage
        );

  return (
    <>
      <div className=" mx-4 lg:mx-8  min-h-screen flex flex-col min-h-screen">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
              Units Page
            </h2>
          </div>
          {/* Filtering and searching div */}
          <div className="flex flex-row">
            <div className="pt-2">
              <FilterComponent
                onFilterChange={handleFilterChange}
                filterOptions={filterOptionsUnits}
              />
            </div>
            <Searchbar onSearch={handleSearch} />
          </div>
        </div>
        <h2 className="text-left text-[#325a67] text-[16px] leading-2 tracking-tight"> View and manage all of the units in your organization. Use the Project Filter on the left or the search bar  and filter above to narrow down results.</h2>
        <div className="p-[10px] rounded-[7px] w-full mx-auto mt-4">
          {isLoading ? (
            <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
              Loading units...
            </p>
          ) : allUnits.length === 0 ? (
            <p> No data available</p>
          ) : currentUnits.length === 0 ? (
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <NoResultsFound searchItem={searchQuery} />
            </div>
          ) : (
            /* Mapping of Filtered units by project selected in navar */
            currentUnits.map((unit) => (
              <UnitComponent
                key={`${unit.projectId}-${unit.unitNumber}`}
                unit={unit}
                projectAddress={unit.projectAddress}
              />
            ))
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <Pagination
            className="custom-pagination"
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      </div>
    </>
  );
};

export default UnitPage;
