"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import UnitComponent from "@/app/components/UnitListComponent";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { Pagination } from "@mui/material";
import { useState, useEffect } from "react";
import { generateMockProjects, Project } from "../../mockData";

const UnitPage = () => {
  const { selectedProjectId, selectedProjectAddress } = useProjectContext();
  const [isMounted, setIsMounted] = useState(false);

  const [projects] = useState<Project[]>(generateMockProjects()); // Initialize with mock projects
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptionsForUnits = ["Address A-Z"];
  const [filter, setFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  // Generate filtered units grouped by project
  const filteredProjects = projects
    .map((project) => {
      const projectMatch = project.address.toLowerCase().includes(searchQuery);
      const filteredUnits = project.units.filter(
        (unit) =>
          unit.unitNumber.toLowerCase().includes(searchQuery) || projectMatch
      );

      return {
        ...project,
        filteredUnits,
      };
    })
    .sort((a, b) => {
      if (filter === "Address A-Z") {
        return a.address.localeCompare(b.address);
      }
      return 0;
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

  //pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentItems = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1>Unit Page</h1>
      {selectedProjectId ? (
        <>
          <p>Selected Project ID: {selectedProjectId}</p>
          <p>Project Address: {selectedProjectAddress}</p>
        </>
      ) : (
        <p>No project selected.</p>
      )}
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6">
        <div className="flex flex row justify-between">
          <div className="flex row">
            <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
              Units
            </h2>
          </div>
          <div className="flex row ">
            <div className="pt-2">
              <FilterComponent
                onFilterChange={handleFilterChange}
                filterOptions={filterOptionsForUnits}
              />
            </div>
            <Searchbar onSearch={handleSearch} />
          </div>
        </div>

        <div className="bg-[#4b7d8d] p-[5px] rounded-[7px] w-full mx-auto">
          {/* / Map through (paginated projects) and render each project's component. */}
          {filteredProjects.every(
            (project) => project.filteredUnits.length === 0
          ) ? (
            <h3 className="font-sequel-sans-medium text-center text-lg text-[#fff] text-[30px] leading-10 tracking-tight">
              No matching projects or units found.
            </h3>
          ) : (
            currentItems.map((project) => (
              <div key={project.projectId}>
                {project.filteredUnits.map((unit) => (
                  <UnitComponent
                    key={unit.unitNumber}
                    unit={unit}
                    projectAddress={project.address}
                  />
                ))}
              </div>
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
