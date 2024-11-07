"use client";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { useEffect, useState } from "react";
import { generateMockProjects, Project, Unit } from "../../mockData";

import UnitComponent from "@/app/components/UnitListComponent";
const UnitPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects] = useState<Project[]>(generateMockProjects()); // Initialize with mock projects

  useEffect(() => {
    const allUnits = projects.flatMap((project) => project.units);
    console.log("All Units: ", allUnits); // Log units
    setUnits(allUnits);
  }, [projects]);

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6">
      <div className="flex flex row justify-between">
        <div className="flex row">
          <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
            Units
          </h2>
        </div>
        {/* <div className="flex row ">
          <Searchbar />
          <div className="pt-2">
            <FilterComponent filterOptions={} />
          </div>
        </div> */}
      </div>

      <div className="bg-[#4b7d8d] p-[5px] rounded-[7px] w-full mx-auto">
        {/* Map through each project and render a UnitComponent for each project’s units */}
        {projects.map((project) => (
          <div key={project.projectId}>
            {project.units.map((unit) => (
              <UnitComponent
                key={unit.unitNumber}
                unit={unit}
                projectAddress={project.address}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitPage;
