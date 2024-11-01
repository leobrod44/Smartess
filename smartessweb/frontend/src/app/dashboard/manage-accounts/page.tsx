"use client";

import ManageAccountsList from "@/app/components/ManageAccountsList";
import {
  Project,
  generateMockProjects,
  Individual,
  currentUserId,
} from "../../mockData"; // Adjust the path as needed

const projects: Project[] = generateMockProjects();

// Function to filter and consolidate users across multiple projects
const getFilteredAndConsolidatedUsers = (
  projects: Project[],
  currentUserId: string
) => {
  const userMap: {
    [individualId: string]: { user: Individual; addresses: Set<string> };
  } = {};

  projects.forEach((project) => {
    // Check if the current user is part of this project using individualId
    const isCurrentUserInProject = project.projectUsers.some(
      (user) => user.individualId === currentUserId
    );

    if (isCurrentUserInProject) {
      // If the current user is part of the project, process other users
      project.projectUsers.forEach((user) => {
        if (user.individualId !== currentUserId) {
          if (!userMap[user.individualId]) {
            // Initialize the user in the map with a set for unique addresses
            userMap[user.individualId] = {
              user,
              addresses: new Set(),
            };
          }
          // Add the current project's address to the user's addresses
          userMap[user.individualId].addresses.add(project.address);
        }
      });
    }
  });

  // Convert the addresses from Set to Array and prepare the final list
  return Object.values(userMap).map(({ user, addresses }) => ({
    user,
    addresses: Array.from(addresses),
  }));
};

const ManageUsersPage = () => {
  // Use the currentUserId from mockData
  const consolidatedUsers = getFilteredAndConsolidatedUsers(
    projects,
    currentUserId
  );

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      {/* Column Labels */}
      <div className="flex font-semibold border-b-2 border-black pb-2 mb-4">
        <p className="flex-1 pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Address
        </p>
        <p className="flex-1 pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          User
        </p>
        <p className="flex-1 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Permission
        </p>
      </div>

      {/* Loop through filtered and consolidated users and render each one */}
      {consolidatedUsers.map(({ user, addresses }) => {
        // Create the address string with "(+1 more)" if necessary
        const addressString =
          addresses.length > 1
            ? `${addresses[0]} (+${addresses.length - 1} more)`
            : addresses[0];

        return (
          <ManageAccountsList
            key={user.individualId} // Use a unique key for project-level users
            address={addressString}
            userName={`${user.firstName} ${user.lastName}`}
            permission={user.role}
          />
        );
      })}
    </div>
  );
};

export default ManageUsersPage;
