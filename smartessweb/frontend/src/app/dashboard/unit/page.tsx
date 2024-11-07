"use client";
import UnitComponent from "@/app/components/UnitListComponent";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { useEffect, useState } from "react";
import { generateMockProjects, Project, Unit } from "../../mockData";

const UnitPage = () => {
  const [projects] = useState<Project[]>(generateMockProjects()); // Initialize with mock projects
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const filterOptionsForUnits = ["Addresse A-Z"];
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const allUnits = projects.flatMap((project) => project.units);
    console.log("All Units: ", allUnits); // Log units
    setAllUnits(allUnits);
  }, [projects]);

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
      if (filter === "Addresse A-Z") {
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

  return (
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
        {/* Map through each project and render a UnitComponent for each project’s units */}
        {filteredProjects.every(
          (project) => project.filteredUnits.length === 0
        ) ? (
          <h3 className="font-sequel-sans-medium text-center text-lg text-[#fff] text-[30px] leading-10 tracking-tight">
            No matching projects or units found.
          </h3>
        ) : (
          filteredProjects.map((project) => (
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
    </div>
  );
};

export default UnitPage;
