"use client";

import ManageAccountsList from "@/app/components/ManageUsersComponents/ManageAccountsList";
import { Project, Individual, OrgUser, CurrentUser } from "../../mockData";
import AddIcon from "@mui/icons-material/Add";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import Pagination from "@mui/material/Pagination";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectContext } from "@/context/ProjectProvider";
import { manageAccountsApi } from "@/api/page";
import AddUserModal from "@/app/components/ManageUsersComponents/AddUserForm";
import NoResultsFound from "@/app/components/NoResultsFound";

const ManageUsersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedProjectAddress } = useProjectContext();
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentOrg, setCurrentOrg] = useState<number | undefined>(undefined);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  // Add roles to filter options
  const filterOptionsManageUsers = [
    "Address A-Z",
    "User A-Z",
    "master",
    "admin",
    "basic",
  ];

  const consolidateUsers = (
    projects: Project[],
    orgUsers: OrgUser[],
    individuals: Individual[],
    currentUserAddresses: string[],
    selectedProjectAddress: string
  ) => {
    const userMap: {
      [individualId: string]: { user: Individual; addresses: string[] };
    } = {};

    const nullProjOrgUsers = orgUsers.filter(
      (orgUser) => orgUser.proj_id === null
    );

    nullProjOrgUsers.forEach((orgUser) => {
      const matchingIndividual = individuals.find(
        (individual) => individual.individualId === orgUser.user_id
      );

      if (matchingIndividual) {
        if (!userMap[matchingIndividual.individualId]) {
          userMap[matchingIndividual.individualId] = {
            user: matchingIndividual,
            addresses: [], // Empty addresses for null projects
          };
        }
      }
    });

    projects.forEach((project) => {
      const shouldIncludeProject =
        selectedProjectAddress === "ALL PROJECTS" ||
        project.address === selectedProjectAddress;

      if (
        shouldIncludeProject &&
        currentUserAddresses.includes(project.address)
      ) {
        // find users in orgUsers linked to the project by proj_id
        const projectOrgUsers = orgUsers.filter(
          (orgUser) => orgUser.proj_id === parseInt(project.projectId, 10)
        );

        // match these orgUsers with individuals by user_id
        projectOrgUsers.forEach((orgUser) => {
          const matchingIndividual = individuals.find(
            (individual) => individual.individualId === orgUser.user_id
          );

          if (matchingIndividual) {
            // add user to the userMap
            if (userMap[matchingIndividual.individualId]) {
              userMap[matchingIndividual.individualId].addresses.push(
                project.address
              );
            } else {
              userMap[matchingIndividual.individualId] = {
                user: matchingIndividual,
                addresses: [project.address],
              };
            }
          } else {
            console.log(
              `No matching individual found for orgUser ${orgUser.user_id}`
            );
          }
        });
      } else {
        console.log(`Skipping project: ${project.projectId}`);
      }
    });

    return Object.values(userMap);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const responseCurrentUser = await manageAccountsApi.getCurrentUserApi(
          token
        );
        const tempCurrentUser = responseCurrentUser.currentUser;
        setCurrentUser({
          userId: tempCurrentUser.userId.toString(),
          role: tempCurrentUser.role,
          address: tempCurrentUser.address,
          firstName: tempCurrentUser.firstName,
          lastName: tempCurrentUser.lastName,
        });

        const responseOrgUsers = await manageAccountsApi.getOrgUsersApi(token);
        const fetchedOrgUsers = responseOrgUsers.orgUsers;
        setOrgUsers(fetchedOrgUsers);
        if (fetchedOrgUsers) {
          setCurrentOrg(fetchedOrgUsers[0].org_id);
        }

        const responseIndividuals =
          await manageAccountsApi.getOrgIndividualsData(fetchedOrgUsers, token);
        const fetchedIndividuals = responseIndividuals.individuals;
        setIndividuals(fetchedIndividuals);

        const responseProjects = await manageAccountsApi.getOrgUsersProjects(
          fetchedOrgUsers,
          token
        );
        const fetchedProjects = responseProjects.projects;
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching organization users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
  };

  const consolidatedUsers = currentUser
    ? consolidateUsers(
        projects,
        orgUsers,
        individuals,
        currentUser.address,
        selectedProjectAddress
      )
    : [];

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
    setIsAddUserModalOpen(true);
  };

  const handleRemoveUser = (uid: number) => {
    setOrgUsers((prevOrgUsers) =>
      prevOrgUsers.filter((orgUser) => orgUser.user_id !== uid)
    );
  };

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="flex items-center pt-4 justify-between mb-8">
        <div className="w-full text-[#325a67] text-[30px] leading-10 tracking-tight whitespace-nowrap">
          Manage Your Organization Users
        </div>
        <div className="flex items-center pt-2 gap-4">
          <FilterComponent
            onFilterChange={handleFilterChange}
            filterOptions={filterOptionsManageUsers}
          />
          <Searchbar onSearch={handleSearch} />
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

        {currentUser && currentUser.role === "master" && (
          <>
            <div
              onClick={handleAddUserClick}
              className="cursor-pointer flex items-center"
              style={{ fontSize: "2rem" }}
            >
              <AddIcon className="text-[#30525E]" fontSize="inherit" />
            </div>
            <AddUserModal
              isOpen={isAddUserModalOpen}
              onClose={() => setIsAddUserModalOpen(false)}
            />
          </>
        )}
      </div>
      <div className="flex-grow">
        {isLoading ? (
          <p className="text-[#729987] text-xl font-sequel-sans-black text-left p-2">
            Loading ...
          </p>
        ) : currentItems.length === 0 && searchQuery === "" ? (
          <p className="text-[#729987] text-xl font-sequel-sans-black text-left p-2">
            No Data Available
          </p>
        ) : filteredUsers.length === 0 && searchQuery !== "" ? (
          <div className="unit-container max-w-fit sm:max-w-full mx-auto">
            <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4">
              <NoResultsFound searchItem={searchQuery} />
            </div>
          </div>
        ) : (
          currentItems.map(({ user, addresses }) => {
            const addressString =
              addresses.length > 1
                ? `${addresses[0]} (+${addresses.length - 1} more)`
                : addresses[0];

            return (
              <ManageAccountsList
                key={user.individualId}
                uid={user.individualId}
                address={addressString}
                userName={`${user.firstName} ${user.lastName}`}
                permission={user.role}
                currentUserRole={currentUser?.role || "basic"}
                addresses={addresses || []}
                currentOrg={currentOrg}
                onUserDeleted={handleRemoveUser}
              />
            );
          })
        )}
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
