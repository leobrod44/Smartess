import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Pagination } from "@mui/material";
import Unit from "../components/Unit";
import { Project } from "../mockData";

interface ProjectInfoProps {
  projects: Project[];
}

export default function ProjectInfo({ projects }: ProjectInfoProps) {
  const [showUnits, setShowUnits] = useState<number | null>(null); // Track which project is toggled open
  const [page, setPage] = useState(1); // Track the current page

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
  const projectsPerPage = 3;
  const startIndex = (page - 1) * projectsPerPage;
  const projectsToDisplay = projects.slice(
    startIndex,
    startIndex + projectsPerPage
  );

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
                Action
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
                  {project.adminUsers}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#729987] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.hubUsers}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#a65146] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.pendingTickets}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <button
                  className="bg-[#4b7d8d] pl-2 text-white w-[82px] h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300"
                  onClick={() => handleToggle(startIndex + index)}
                >
                  More
                  {showUnits === startIndex + index ? (
                    <ChevronUpIcon className="w-5 h-5 ml-2" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 ml-2" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {showUnits === startIndex + index && (
            <div className="pt-4 space-y-4 max-h-60 overflow-x-hidden overflow-y-auto custom-scrollbar pr-4">
              {project.units.map((unit) => (
                <Unit
                  key={`${project.projectId}-${unit.unitNumber}`}
                  unitNumber={unit.unitNumber}
                  projectId={project.projectId}
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
