"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { /*generateMockSurveillanceCameras, */Project } from "../../mockData";
import { surveillanceApi } from "@/api/page";

const SurveillancePage = () => {
  const router = useRouter();
  // const videoFrames = Array(16).fill(null);
  // const mockData = generateMockSurveillanceCameras();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const { selectedProjectAddress } = useProjectContext();

  const unitsPerPage = 4;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchCurrentUserProjects = async () => {
      setIsLoading(true);
      const responseProjects = await surveillanceApi.getUserProjects(token);
      const fetchedProjects = responseProjects.projects;
      setProjects(fetchedProjects);
      setIsLoading(false);
    };

    fetchCurrentUserProjects();
  }, [router]);

  const allUnits = projects.flatMap((project) =>
    project.units.map((unit) => ({
      ...unit,
      projectAddress: project.address,
      pendingTickets: unit.tickets.pending,
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

      return matchesProjectAddress;
    });

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6">
        {isLoading ? (
          <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
            Loading surveillance data...
          </p>
        ) : (
          <>
            <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
              <h4>Surveillance Page</h4>
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {filteredUnitsByProject.slice(0, unitsPerPage).map((unit, index) => (
                <div key={index} className="border p-2 bg-[#4b7d8d] rounded-lg">
                  <video className="w-full h-auto" controls>
                    <source src="your-video-file.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-white">{unit.projectAddress}</p>
                    <p className="text-sm text-white text-right">{unit.unitNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

};

export default SurveillancePage;
