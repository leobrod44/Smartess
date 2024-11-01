"use client";

import ManageAccountsList from "@/app/components/ManageAccountsList";
import { Project, generateMockProjects, Individual } from "../../mockData";

const projects: Project[] = generateMockProjects();

// Function to consolidate users across multiple projects
const consolidateUsers = (projects: Project[]) => {
  const userMap: {
    [tokenId: string]: { user: Individual; addresses: string[] };
  } = {};
  projects.forEach((project) => {
    project.projectUsers.forEach((user) => {
      if (userMap[user.individualId]) {
        // If the user already exists, add the new project address
        userMap[user.individualId].addresses.push(project.address);
      } else {
        // If the user is new, add them to the map
        userMap[user.individualId] = {
          user,
          addresses: [project.address],
        };
      }
    });
  });

  return Object.values(userMap);
};
const ManageUsersPage = () => {
  const consolidatedUsers = consolidateUsers(projects);

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

      {/* Loop through consolidated users and render each one */}
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
