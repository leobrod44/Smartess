import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Unit from "../components/Unit";
import { generateMockProjects } from "../mockData";
import { projectApi } from "@/api/components/ProjectComponent";

interface ApiProject {
  proj_id: string;
  name: string;
  address: string;
  units_count: number;
  hub_users_count: number;
  admin_users_count: number;
  pending_tickets_count: number;
}

export default function ProjectInfo() {
  const [showUnits, setShowUnits] = useState<number | null>(null);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get mock data for units
  const mockProjects = generateMockProjects();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const data = await projectApi.getUserProjects(token);
        setProjects(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleToggle = (index: number) => {
    setShowUnits(showUnits === index ? null : index);
  };

  if (loading) {
    return <div className="w-full flex justify-center items-center p-8">
      <div className="text-[#14323B] text-lg">Loading projects...</div>
    </div>;
  }

  if (error) {
    return <div className="w-full flex justify-center items-center p-8">
      <div className="text-red-600 text-lg">{error}</div>
    </div>;
  }

  return (
    <div className="w-full">
      {projects.map((project, index) => (
        <div
          key={project.proj_id}
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
              <p className="mt-1">{project.units_count}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#729987] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.admin_users_count}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#729987] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.hub_users_count}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[78px] h-8 px-5 bg-[#a65146] rounded-[20px] justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-white text-base leading-tight tracking-tight">
                  {project.pending_tickets_count}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <button
                  className="bg-[#4b7d8d] pl-2 text-white w-[82px] h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300"
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
              {mockProjects[index].units.map((unit) => (
                <Unit
                  key={`${mockProjects[index].projectId}-${unit.unitNumber}`}
                  unitNumber={unit.unitNumber}
                  projectId={mockProjects[index].projectId}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}