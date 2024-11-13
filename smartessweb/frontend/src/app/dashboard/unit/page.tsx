"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import UnitComponent from "@/app/components/UnitListComponent";
import { useState, useEffect } from "react";
import { generateMockProjects, Project } from "../../mockData";

const UnitPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [projects] = useState<Project[]>(generateMockProjects());
  const { selectedProjectAddress } = useProjectContext();

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
      hubUsers: project.hubUsers,
      hubOwners: unit.owner,
      pendingTickets: unit.ticket[2],
    }))
  );

  // Filtering by project in Navbar
  const filteredUnitsByProject = allUnits.filter((unit) => {
    const effectiveProjectAddress = selectedProjectAddress || "ALL PROJECTS";
    const matchesProjectAddress =
      effectiveProjectAddress === "ALL PROJECTS"
        ? true
        : unit.projectAddress === effectiveProjectAddress;

    return matchesProjectAddress;
  });

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
          <div className="flex flex-row"></div>
        </div>

        <div className="bg-[#4b7d8d] p-[10px] rounded-[7px] w-full mx-auto mt-4">
          {/* Mapping of Filtered units by project selected in navar */}
          {filteredUnitsByProject.map((unit) => (
            <UnitComponent
              key={unit.unitNumber}
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
