import React, { useState } from "react";
import { Typography } from "@mui/material";
import Searchbar from "../Searchbar";

interface ProjectAddressMenuProps {
  unlinkedProjects: { projectId: number; address: string }[];
  onSelectProject: (project: { projectId: number; address: string }) => void;
}

function ProjectAddressMenu({
  unlinkedProjects,
  onSelectProject,
}: ProjectAddressMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Handle search filter
  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter addresses based on the search query
  const filteredAddresses = unlinkedProjects.filter((project) =>
  project.address.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <div className="mt-4 border rounded p-2 w-full mb-4">
      {/* Search bar component */}
      <Searchbar onSearch={handleSearch} />

      {/* Filtered address list */}
      <div className="max-h-52 overflow-y-auto custom-scrollbar mt-2">
        {filteredAddresses.length > 0 ? (
          filteredAddresses.map((project, index) => (
            <div
              key={index}
              onClick={() => onSelectProject(project)}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded"
            >
              {project.address}
            </div>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No projects match your search
          </Typography>
        )}
      </div>
    </div>
  );
}

export default ProjectAddressMenu;
