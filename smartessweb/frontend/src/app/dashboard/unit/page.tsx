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

const unitsPerPage = 3;

const UnitPage = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { selectedProjectAddress } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filterOptionsUnits = ["Most Pending Tickets"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      const responseProjects = await unitsApi.getUserProjects(token);
      const fetchedProjects = responseProjects.projects;
      setProjects(fetchedProjects);
    }

    fetchData();
    setIsMounted(true);
  }, [router]);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

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
            unit.owner.lastName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.hubUsers.some((user) =>
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            ) // Check each user's first and last name
          : unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.owner.lastName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            unit.hubUsers.some((user) =>
              user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            );

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
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
              Units
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

        <div className="bg-[#4b7d8d] p-[10px] rounded-[7px] w-full mx-auto mt-4">
          {/* Check if currentUnits is empty and display a message */}
          {currentUnits.length === 0 ? (
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4 shadow-xl">
                <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
                  No results found.
                  <br />
                  Please adjust your filters or search criteria.
                </p>
              </div>
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
    </div>
  );
};

export default UnitPage;
