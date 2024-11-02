"use client";

import ManageAccountsList from "@/app/components/ManageAccountsList";
import { Project, generateMockProjects, Individual } from "../../mockData";
import AddIcon from "@mui/icons-material/Add";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import Pagination from "@mui/material/Pagination";
import { useState } from "react";

const itemsPerPage = 8;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filterOptionsManageUsers = ["Address A-Z", "User A-Z"];
  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };
  const consolidatedUsers = consolidateUsers(projects, currentUser.address);
  const filteredUsers = consolidatedUsers
    .filter(({ user, addresses }) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const addressString = addresses.join(" ").toLowerCase();
      const query = searchQuery.toLowerCase();

      return fullName.includes(query) || addressString.includes(query);
    })
    .sort((a, b) => {
      if (filter === "Address A-Z") {
        // Sort by address alphabetically
        return a.addresses[0].localeCompare(b.addresses[0]);
      } else if (filter === "User A-Z") {
        // Sort by user name alphabetically
        const nameA = `${a.user.firstName} ${a.user.lastName}`;
        const nameB = `${b.user.firstName} ${b.user.lastName}`;
        return nameA.localeCompare(nameB);
      }
      return 0; // No sorting if no sort filter is selected
    });
  //pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  // Function to handle search input change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleAddUserClick = () => {
    // Implement the functionality to add a user
    console.log("Add user clicked!");
  };

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="flex justify-end mb-4">
        <Searchbar onSearch={handleSearch} />
        <div className="pt-2">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsManageUsers}
          />
        </div>
      </div>
      <div className="flex font-semibold border-b-2 border-black pb-2 mb-4">
        <p className="flex-1 pl-2 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Project
        </p>
        <p className="flex-1 pl-2  text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          User
        </p>
        <p className="flex-1 pr-6 text-[#30525E] text-lg font-sequel-sans-medium leading-tight tracking-tight">
          Permission
        </p>

        {currentUser.role === "master" && (
          <div
            onClick={handleAddUserClick} //function yet to be implemented
            className="cursor-pointer  flex items-center"
            style={{ fontSize: "2rem" }}
          >
            <AddIcon className="text-[#30525E]" fontSize="inherit" />
          </div>
        )}
      </div>
      <div className="flex-grow">
        {currentItems.map(({ user, addresses }) => {
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
              addresses={addresses || []}
            />
          );
        })}
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination
          className="custom-pagination"
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default ManageUsersPage;
