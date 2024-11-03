'use client';
import { useEffect, useState } from "react";
import { generateMockProjects, Project, Unit } from "../../mockData";

import UnitComponent from "@/app/components/UnitListComponent";
const UnitPage = () => {
  const [units, setUnits] = useState<Unit[]>([]); 
  const [projects] = useState<Project[]>(generateMockProjects()); // Initialize with mock projects

  useEffect(() => {
    const allUnits = projects.flatMap(project => project.units); 
    console.log("All Units: ", allUnits); // Log units
    setUnits(allUnits);
  }, [projects]);

  return (
   <div>
    <h2>Your Units</h2>
    <div className="bg-[#4b7d8d] p-[5px] rounded-[7px] max-w-fit sm:max-w-full mx-auto">
       {/* Map through each project and render a UnitComponent for each project’s units */}
       {projects.map((project) => (
          <div key={project.projectId}> 
            {project.units.map((unit) => (
            <UnitComponent 
            key={unit.unitNumber} 
            unit={unit}
            projectAddress={project.address} />
          ))}
          </div>
        ))}
 </div>
 </div>
  );
};

export default UnitPage;
