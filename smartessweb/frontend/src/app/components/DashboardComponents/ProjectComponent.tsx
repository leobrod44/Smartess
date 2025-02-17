import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Pagination } from "@mui/material";
import Unit from "../Unit";
import { Project } from "../../mockData";
import { useRouter } from "next/navigation";

interface ProjectInfoProps {
  projects: Project[];
}

export default function ProjectInfo({ projects }: ProjectInfoProps) {
  const [showUnits, setShowUnits] = useState<number | null>(null); // Track which project is toggled open
  const [page, setPage] = useState(1); // Track the current page
  const router = useRouter();
  const handleToggle = (index: number) => {
    setShowUnits(showUnits === index ? null : index);
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    setShowUnits(null); // Close any expanded units when changing page
  };

  // Calculate which projects to display based on the current page
  const projectsPerPage = 6;
  const startIndex = (page - 1) * projectsPerPage;
  const projectsToDisplay = projects.slice(
    startIndex,
    startIndex + projectsPerPage
  );

  const handleNavToUnit = (projectAddress: string, unitNumber: string) => {
    router.push(
      `../dashboard/individual-unit/${projectAddress}/unit/${unitNumber}`
    );
  };

  return (
    <div className="w-full">
      {projectsToDisplay.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 my-2 border border-black border-opacity-30 hover:border-[#4b7d8d] transition duration-300"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 w-full border-b border-gray-300 pb-2">
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                Address
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                Units
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                Admin Users
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                Hub Users
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                Pending Tickets
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-lg font-sequel-sans-medium leading-tight tracking-tight">
                View Units
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 w-full pt-2">
            <div className="text-center">
              <p className="mt-1">{project.address}</p>
            </div>
            <div className="text-center">
              <p className="mt-1">{project.units.length}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#729987] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.adminUsersCount}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#729987] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.hubUsersCount}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#a65146] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.pendingTicketsCount}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <button
                  aria-label="View Units"
                  className="bg-[#4b7d8d]  text-white w-[78px] h-8 rounded-lg shadow-md flex items-center justify-center  hover:bg-[#266472] hover:scale-105 transition-transform duration-300"
                  onClick={() => handleToggle(startIndex + index)}
                >
                  {showUnits === startIndex + index ? (
                    <>
                      <ChevronUpIcon className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {showUnits === startIndex + index && (
            <div className="pt-4 space-y-4 max-h-[390px] overflow-x-hidden overflow-y-auto custom-scrollbar pr-4">
              {project.units.map((unit) => (
                <Unit
                  key={`${project.projectId}-${unit.unitNumber}`}
                  unitNumber={unit.unitNumber}
                  projectId={project.projectId}
                  onClick={() =>
                    handleNavToUnit(project.address, unit.unitNumber)
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Pagination  */}
      <div className="flex justify-center mt-8">
        <Pagination
          className="custom-pagination"
          count={Math.ceil(projects.length / projectsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </div>
    </div>
  );
}
