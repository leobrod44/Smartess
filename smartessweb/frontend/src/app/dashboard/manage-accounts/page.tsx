"use client";

import ManageAccountsList from "@/app/components/ManageAccountsList";
import { Project, generateMockProjects, Individual } from "../../mockData";
import AddIcon from "@mui/icons-material/Add";

const projects: Project[] = generateMockProjects();

// Mock current user with a "master" role
const currentUser: {
  individualId: string;
  role: "master" | "admin" | "basic";
  address: string[];
} = {
  individualId: "10",
  role: "master",
  address: [
    "1000 De La Gauchetiere",
    "750 Rue Peel",
    "131 Chemin des Conifere",
  ],
};

const consolidateUsers = (
  projects: Project[],
  currentUserAddresses: string[]
) => {
  const userMap: {
    [tokenId: string]: { user: Individual; addresses: string[] };
  } = {};

  projects.forEach((project) => {
    // Check if the project address is linked to the current user
    if (currentUserAddresses.includes(project.address)) {
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
    }
  });

  return Object.values(userMap);
};

const ManageUsersPage = () => {
  // Filter users to only those linked to the current user's addresses
  const consolidatedUsers = consolidateUsers(projects, currentUser.address);
  const handleAddUserClick = () => {
    // Implement the functionality to add a user
    console.log("Add user clicked!");
  };
  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
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

        {currentUser.role === "master" && (
          <div
            onClick={handleAddUserClick}
            className="cursor-pointer  flex items-center"
            style={{ fontSize: "2rem" }}
          >
            <AddIcon className="text-[#30525E]" fontSize="inherit" />
          </div>
        )}
      </div>

      {/* Loop through consolidated users and render each one */}
      {consolidatedUsers.map(({ user, addresses }) => {
        // Create the address string with "(+1 more)" only if there are multiple addresses
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
            currentUserRole={currentUser.role}
          />
        );
      })}
    </div>
  );
};

export default ManageUsersPage;
