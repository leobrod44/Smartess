import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"; // Import icons for the arrow

// Mock Unit Component
const Unit = () => {
  return (
    <div className="bg-gray-100 p-4 mt-2 rounded-lg shadow-inner">
      <p>This is the Unit component content!</p>
    </div>
  );
};

// TypeScript Interface
export interface Project {
  address: string;
  units: number;
  adminUsers: number;
  hubUsers: number;
  pendingTickets: number;
}

// Mock Data
const MOCK_PROJECTS: Project[] = [
  {
    address: "1000 De La Gauchetiere",
    units: 3,
    adminUsers: 1,
    hubUsers: 6,
    pendingTickets: 4,
  },
  {
    address: "750 Peel Street",
    units: 10,
    adminUsers: 2,
    hubUsers: 12,
    pendingTickets: 5,
  },
  {
    address: "1500 Maisonneuve Blvd",
    units: 5,
    adminUsers: 1,
    hubUsers: 8,
    pendingTickets: 3,
  },
];

export default function ProjectInfo() {
  const [showUnit, setShowUnit] = useState<number | null>(null); // Track which project is toggled open

  const handleToggle = (index: number) => {
    setShowUnit(showUnit === index ? null : index); // Toggle between opening and closing
  };

  return (
    <div>
      {/* Loop through each project in MOCK_PROJECTS */}
      {MOCK_PROJECTS.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 my-2 border border-black border-opacity-30"
        >
          {/* Labels as a grid with border under it */}
          <div className="grid grid-cols-6 gap-4 w-full border-b border-gray-300 pb-2">
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Address
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Units
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Admin Users
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Hub Users
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Pending Tickets
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#14323B] text-xl font-sequel-sans-medium leading-tight tracking-tight">
                Action
              </p>
            </div>
          </div>

          {/* Project data as a grid without a border */}
          <div className="grid grid-cols-6 gap-4 w-full pt-2">
            <div className="text-center">
              <p className="mt-1">{project.address}</p>
            </div>
            <div className="text-center">
              <p className="mt-1">{project.units}</p>
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
                <div className="text-center text-white text-base  leading-tight tracking-tight">
                  {project.pendingTickets}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <button
                  className="bg-[#4b7d8d] text-white rounded-full px-4 py-2 flex items-center justify-center"
                  onClick={() => handleToggle(index)}
                >
                  More
                  {showUnit === index ? (
                    <ChevronUpIcon className="w-5 h-5 ml-2" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 ml-2" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Render the Unit component when "More" is clicked */}
          {showUnit === index && <Unit />}
        </div>
      ))}
    </div>
  );
}
