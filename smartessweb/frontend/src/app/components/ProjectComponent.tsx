import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"; // Import icons for the arrow
import Unit from "../components/Unit";
//  Interface
export interface UnitData {
  unitNumber: string;
}

export interface Project {
  projectId: string;
  address: string;
  units: UnitData[]; // Array of units
  adminUsers: number;
  hubUsers: number;
  pendingTickets: number;
}

// Mock Data
const MOCK_PROJECTS: Project[] = [
  {
    projectId: "a10294",
    address: "1000 De La Gauchetiere",
    units: [
      { unitNumber: "101" },
      { unitNumber: "102" },
      { unitNumber: "103" },
    ],
    adminUsers: 1,
    hubUsers: 6,
    pendingTickets: 4,
  },
  {
    projectId: "b10294",
    address: "750 Peel Street",
    units: [{ unitNumber: "201" }, { unitNumber: "202" }],
    adminUsers: 2,
    hubUsers: 12,
    pendingTickets: 5,
  },
  {
    projectId: "c10294",
    address: "1500 Maisonneuve Blvd",
    units: [
      { unitNumber: "301" },
      { unitNumber: "302" },
      { unitNumber: "303" },
      { unitNumber: "304" },
    ],
    adminUsers: 1,
    hubUsers: 8,
    pendingTickets: 3,
  },
];

export default function ProjectInfo() {
  const [showUnits, setShowUnits] = useState<number | null>(null); // Track which project is toggled open

  const handleToggle = (index: number) => {
    setShowUnits(showUnits === index ? null : index);
  };

  return (
    <div className="w-full">
      {/* Loop through each project */}
      {MOCK_PROJECTS.map((project, index) => (
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
                  className="bg-[#4b7d8d] text-white rounded-full px-4 py-2 flex items-center justify-center hover:bg-[#266472] transition duration-300"
                  onClick={() => handleToggle(index)}
                >
                  More
                  {showUnits === index ? (
                    <ChevronUpIcon className="w-5 h-5 ml-2" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 ml-2" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {showUnits === index && (
            <div className="pt-4 space-y-4 max-h-60 overflow-x-hidden overflow-y-auto custom-scrollbar pr-4">
              {" "}
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
    </div>
  );
}
