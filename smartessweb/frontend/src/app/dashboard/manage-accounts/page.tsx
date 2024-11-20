"use client";

import ManageAccountsList from "@/app/components/ManageUsersComponents/ManageAccountsList";
import { Project, generateMockProjects, Individual, OrgUser } from "../../mockData";
import AddIcon from "@mui/icons-material/Add";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import Pagination from "@mui/material/Pagination";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectContext } from "@/context/ProjectProvider";
import { orgUsersApi } from "@/api/page";

const itemsPerPage = 8;
const projects: Project[] = generateMockProjects();

/*  Mock current organization user data, this is different from the data 
    displayed on the page (all organization users) which you can find in the mockData.tsx
    This data is only used for the logic of displaying different UI
    based on the current user role (master,admn, or basic) and addresses -
     only organization users that share the same addresses as currentUser
    are displayed in the page as they should belong to the same organizations 
    ie: currentUser is an organization user currently logged into the system 
*/
const currentUser: {
  orgUserId: string;
  role: "master" | "admin" | "basic";
  address: string[];
} = {
  orgUserId: "ind-7",                                                                             /// REMOVE THIS PART AND FETCH FROM BACKEND
  role: "master",
  address: ["1000 De La Gauchetiere", "750 Peel Street"],
};

const consolidateUsers = (
  projects: Project[],
  currentUserAddresses: string[],
  selectedProjectAddress: string
) => {
  const userMap: {
    [tokenId: string]: { user: Individual; addresses: string[] };
  } = {};

  projects.forEach((project) => {
    const shouldIncludeProject =
      selectedProjectAddress === "ALL PROJECTS" ||
      project.address === selectedProjectAddress;

    if (
      shouldIncludeProject &&
      currentUserAddresses.includes(project.address)
    ) {
      project.projectUsers.forEach((user) => {
        if (userMap[user.individualId]) {
          userMap[user.individualId].addresses.push(project.address);
        } else {
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedProjectAddress } = useProjectContext();
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  
  // Add roles to filter options
  const filterOptionsManageUsers = [
    "Address A-Z",
    "User A-Z",
    "master",
    "admin",
    "basic",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchOrgUsers = async () => {
      try {
        console.log("Fetching organization users...");
        const responseOrgUsers = await orgUsersApi.getOrgUsersApi(token);
        const fetchedOrgUsers = responseOrgUsers.orgUsers;

        setOrgUsers(fetchedOrgUsers);
        console.log("orgUsers: ", fetchedOrgUsers)

        const responseIndividuals = await orgUsersApi.getOrgIndividualsData(fetchedOrgUsers, token);
        const fetchedIndividuals = responseIndividuals.individuals;
        console.log("individuals: ", fetchedIndividuals)

        const responseProjects = await orgUsersApi.getOrgUsersProjects(fetchedOrgUsers, token);
        const fetchedProjects = responseProjects.projects;
        console.log("projects: ", fetchedProjects)

        console.log(orgUsers)

        console.log("Organization users fetched successfully.");
      } catch (err) {
        console.error("Error fetching organization users:", err);
      } finally {
        //setLoading(false);
      }
    };

    fetchOrgUsers();

  }, [router]);

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

  const consolidatedUsers = consolidateUsers(
    projects,
    currentUser.address,
    selectedProjectAddress
  );

  const filteredUsers = consolidatedUsers
    .filter(({ user, addresses }) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const addressString = addresses.join(" ").toLowerCase();
      const role = user.role.toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        fullName.includes(query) ||
        addressString.includes(query) ||
        role.includes(query);

      const matchesFilter =
        filter === "" ||
        filter === "Address A-Z" ||
        filter === "User A-Z" ||
        user.role.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (filter === "Address A-Z") {
        return a.addresses[0].localeCompare(b.addresses[0]);
      } else if (filter === "User A-Z") {
        const nameA = `${a.user.firstName} ${a.user.lastName}`;
        const nameB = `${b.user.firstName} ${b.user.lastName}`;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  // Pagination logic
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

  // Search input change handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddUserClick = () => {
    console.log("Add user clicked!");
  };

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="flex justify-end mb-4">
        <div className="pt-2">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsManageUsers}
          />
        </div>
        <Searchbar onSearch={handleSearch} />
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
            onClick={handleAddUserClick}
            className="cursor-pointer flex items-center"
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
              key={user.individualId}
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
