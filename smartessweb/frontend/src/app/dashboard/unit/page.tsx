"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import UnitComponent from "@/app/components/UnitListComponent";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { useState, useEffect } from "react";
import { generateMockProjects, Project } from "../../mockData";

const UnitPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [projects] = useState<Project[]>(generateMockProjects());
  const { selectedProjectAddress } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const filterOptionsUnits = ["Most Pending Tickets"];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  // Mapping Units to components with Mock Data
  const allUnits = projects.flatMap((project) =>
    project.units.map((unit) => ({
      ...unit,
      projectAddress: project.address,
      projectId: project.projectId,
      hubUsersCount: project.hubUsersCount,
      hubOwners: unit.owner,
      pendingTickets: unit.ticket[2],
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
  };

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

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
          {/* Mapping of Filtered units by project selected in navar */}
          {filteredUnitsByProject.map((unit) => (
            <UnitComponent
              key={`${unit.projectId}-${unit.unitNumber}`}
              unit={unit}
              projectAddress={unit.projectAddress}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
