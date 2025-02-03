import React, { useEffect, useState } from "react";
import { Modal, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { TrashIcon } from "@heroicons/react/24/outline";
import AddIcon from "@mui/icons-material/Add";
import DeleteConfirmationPopup from "./DeleteConfirmation";
import RoleEditForm from "./RoleEditForm";
import ProjectAddressMenu from "./ProjectAddressMenu";
import { Project } from "../../mockData";
import { manageAccountsApi } from "@/api/page";
import router from "next/router";

interface UserInfoModalProps {
  uid: number;
  open: boolean;
  onClose: () => void;
  userName: string;
  role: "admin" | "basic" | "master";
  addresses: string[];
  currentUserRole: "admin" | "basic" | "master";
  currentOrg: number | undefined;
  onDeleteUser: (uid: number) => void;
  onSave: (addresses: string[]) => void;
}

function UserInfoModal({
  uid,
  open,
  onClose,
  userName,
  role: initialRole,
  addresses: initialAddresses,
  currentUserRole,
  currentOrg,
  onDeleteUser,
  onSave,
}: UserInfoModalProps) {
  const [role, setRole] = useState<"admin" | "basic" | "master">(initialRole);
  const [addresses, setAddresses] = useState<string[]>(initialAddresses);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isProjectMenuOpen, setProjectMenuOpen] = useState(false);
  const [isUserDeletion, setIsUserDeletion] = useState(false);
  const [orgProjects, setOrgProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [projectIdsToDelete, setProjectIdsToDelete] = useState<number[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchOrgProjectsData = async () => {
      try {
        const responseOrgProjects = await manageAccountsApi.getOrgProjects(
          currentOrg,
          token
        );
        const fetchedOrgProjects = responseOrgProjects.orgProjects;
        setOrgProjects(fetchedOrgProjects);
      } catch (err) {
        console.error("Error fetching organization projects:", err);
      }
    };

    fetchOrgProjectsData();
  }, [addresses, currentOrg]);

  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handleModalClose = () => {
    setRole(initialRole);
    setAddresses(initialAddresses);
    onClose();
  };

  const handleEditRoleClick = () => {
    setIsEditingRole(!isEditingRole);
  };

  const handleRoleChange = (newRole: "admin" | "basic" | "master") => {
    setRole(newRole);
  };

  const handleSaveRoleChange = () => {
    setIsEditingRole(false);
  };

  const handleDeleteClick = (address: string) => {
    const updatedAddresses = addresses.filter((addr) => addr !== address);
    const project = orgProjects.find((proj) => proj.address === address);

    if (project) {
      setProjectIdsToDelete((prevIds) => [
        ...prevIds,
        Number(project.projectId),
      ]);
    }

    setAddresses(updatedAddresses);
  };

  const handleDeleteUserClick = () => {
    setIsUserDeletion(true); // Set to true for user deletion
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isUserDeletion) {
      onDeleteUser(uid); // Handle user deletion
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
  };

  const handleAddClick = () => {
    setProjectMenuOpen(!isProjectMenuOpen);
  };

  const handleProjectSelect = async (project: {
    projectId: number;
    address: string;
  }) => {
    setAddresses((prevAddresses) => [...prevAddresses, project.address]);

    if (selectedProjectIds.includes(project.projectId)) {
      setSelectedProjectIds(
        selectedProjectIds.filter((id) => id !== project.projectId)
      );
    } else {
      setSelectedProjectIds((prevIds) => [...prevIds, project.projectId]);
    }

    setProjectMenuOpen(false);
  };
  
  const handleSave = async () => {
    try {
      // remove matching IDs from both arrays in case a user adds a project then removes it
      const filteredSelectedProjectIds = selectedProjectIds.filter(
        (id) => !projectIdsToDelete.includes(id)
      );
      const filteredProjectIdsToDelete = projectIdsToDelete.filter(
        (id) => !selectedProjectIds.includes(id)
      );

      // update the states with filtered arrays
      setSelectedProjectIds(filteredSelectedProjectIds);
      setProjectIdsToDelete(filteredProjectIdsToDelete);

      if (
        JSON.stringify(filteredSelectedProjectIds) !==
        JSON.stringify(filteredProjectIdsToDelete)
      ) {
        await assignOrgUserProject(uid, currentOrg, selectedProjectIds, role);
        await removeOrgUserProject(uid, currentOrg, projectIdsToDelete);
      }

      if (role !== initialRole) {
        await changeUserRole(uid, currentOrg, role);
      }

      setSelectedProjectIds([]);
      setProjectIdsToDelete([]);

      onSave(addresses);
    } catch (err) {
      console.error("Error during save:", err);
    }
  };

  const assignOrgUserProject = async (
    uid: number,
    currentOrg: number | undefined,
    projectIds: number[],
    role: "admin" | "basic" | "master"
  ) => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      await manageAccountsApi.assignOrgUserToProject(
        uid,
        currentOrg,
        projectIds,
        role,
        token
      );
    } catch (err) {
      console.error("Error assigning user to project:", err);
    }
  };

  const removeOrgUserProject = async (
    uid: number,
    currentOrg: number | undefined,
    projectIds: number[]
  ) => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      await manageAccountsApi.removeOrgUserFromProject(
        uid,
        currentOrg,
        projectIds,
        token
      );
    } catch (err) {
      console.error("Error removing user from project:", err);
    }
  };

  const changeUserRole = async (
    uid: number,
    currentOrg: number | undefined,
    role: "admin" | "basic" | "master"
  ) => {
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      await manageAccountsApi.changeOrgUserRole(uid, currentOrg, role, token);
    } catch (err) {
      console.error("Error changing organization user's role:", err);
    }
  };

  const unlinkedProjects: { projectId: number; address: string }[] = orgProjects
    .filter((project) => !addresses.includes(project.address))
    .map((project) => ({
      projectId: Number(project.projectId),
      address: project.address,
    }));

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-details-modal">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
        <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-lg p-10 overflow-y-auto max-h-[90vh] ">
          <button
            onClick={() => {
              handleModalClose();
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          >
            ✕
          </button>

          <div className="flex flex-col items-center justify-center">
            <Typography
              variant="h6"
              id="user-details-modal"
              className="text-[#254752] text-s font-sequel-sans-black mb-4"
            >
              {capitalizeWords(userName)}
            </Typography>

            <div className="border p-2 rounded shadow-md w-full mb-4 flex items-center relative">
              <p className="mb-1 text-[#30525E] text-lg font-sequel-sans-medium">
                Role
              </p>
              <div className="flex-1 ">
                {isEditingRole ? (
                  <div className="flex flex-col space-y-2 items-center">
                    <RoleEditForm
                      currentRole={role}
                      onRoleChange={handleRoleChange}
                      onSave={handleSaveRoleChange}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center">
                    <span className="inline-block px-6 py-1 border border-[#30525E] rounded-full">
                      {capitalizeWords(role)}
                    </span>
                  </div>
                )}
              </div>
              {(currentUserRole === "master" || currentUserRole === "admin") &&
                !isEditingRole &&
                role !== "master" && (
                  <IconButton
                    className="ml-4 text-[#30525E] relative z-10"
                    onClick={handleEditRoleClick}
                  >
                    <EditIcon />
                  </IconButton>
                )}
            </div>

            <div className="flex items-center w-full">
              <Typography
                variant="body1"
                className="mb-1 text-[#30525E] text-lg font-sequel-sans-black mb-4 text-left w-full pl-2"
              >
                <strong>Projects</strong>
              </Typography>
              {currentUserRole === "master" && (
                <IconButton className="text-[#30525E]" onClick={handleAddClick}>
                  <AddIcon />
                </IconButton>
              )}
            </div>

            {isProjectMenuOpen && (
              <ProjectAddressMenu
                unlinkedProjects={unlinkedProjects}
                onSelectProject={handleProjectSelect}
              />
            )}

            {/* Project Address Cards */}
            <div className="flex flex-col gap-2 w-full mt-4">
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className="account-card border p-2 rounded shadow-md flex items-center justify-between"
                >
                  <p className="flex-1">{address}</p>
                  {currentUserRole === "master" && (
                    <button onClick={() => handleDeleteClick(address)}>
                      <TrashIcon className="h-5 w-5 mx-auto text-red-500 hover:text-red-900  " />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Save and Delete Buttons */}
          <div className="flex justify-around mt-6">
            {/* Delete button only for master */}
            {currentUserRole === "master" && (
              <button
                onClick={handleDeleteUserClick}
                className="bg-[#ff5449] text-white text-xs w-[120px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300 "
              >
                <div className="text-center text-white text-lg font-['Sequel Sans']">
                  Delete User
                </div>
              </button>
            )}
            {/* Save button for both admin and master */}
            {(currentUserRole === "master" || currentUserRole === "admin") && (
              <button
                onClick={handleSave}
                className="bg-[#4b7d8d] text-white text-xs w-[120px] py-2 rounded-md hover:bg-[#254752] transition duration-300 "
              >
                <div className="text-center text-white text-lg font-['Sequel Sans']">
                  Save
                </div>
              </button>
            )}
          </div>

          {isDeletePopupOpen && (
            <DeleteConfirmationPopup
              userName={userName}
              onConfirm={handleConfirmDelete}
              isUserDeletion={isUserDeletion}
              onCancel={handleCancelDelete}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
