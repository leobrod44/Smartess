import React, { useEffect, useState } from "react";
import { Modal, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
  onDeleteUser: () => void;
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
  onSave
}: UserInfoModalProps) {
  const [role, setRole] = useState<"admin" | "basic" | "master">(initialRole);
  const [addresses, setAddresses] = useState<string[]>(initialAddresses);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isProjectMenuOpen, setProjectMenuOpen] = useState(false);
  const [isUserDeletion, setIsUserDeletion] = useState(false);
  const [orgProjects, setOrgProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [projectIdsToDelete, setProjectIdsToDelete] = useState<number[]>([]);
  const token = localStorage.getItem("token");

  useEffect ( () => {

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchOrgProjectsData = async () => {
      try {
        const responseOrgProjects = await manageAccountsApi.getOrgProjects(currentOrg, token);
        const fetchedOrgProjects = responseOrgProjects.orgProjects;
        setOrgProjects(fetchedOrgProjects);

      } catch (err) {
        console.error("Error fetching organization projects:", err);
      }
    };

    fetchOrgProjectsData();
  } , [addresses, currentOrg] );

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
    setAddressToDelete(address);
    setIsUserDeletion(false);
    setDeletePopupOpen(true);
  };

  const handleDeleteUserClick = () => {
    setIsUserDeletion(true); // Set to true for user deletion
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isUserDeletion) {
      onDeleteUser(); // Handle user deletion
    } else if (addressToDelete) {
      const updatedAddresses = addresses.filter(
        (addr) => addr !== addressToDelete
      );

      const project = orgProjects.find((proj) => proj.address === addressToDelete);
      if (project) {
        setProjectIdsToDelete((prevIds) => [...prevIds, Number(project.projectId)]);
      }
      setAddresses(updatedAddresses);
    }
    setDeletePopupOpen(false);
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
  };

  const handleAddClick = () => {
    setProjectMenuOpen(!isProjectMenuOpen);
  };

  const handleProjectSelect = async (project: { projectId: number; address: string }) => {
      setAddresses((prevAddresses) => [...prevAddresses, project.address]);
      
      if (selectedProjectIds.includes(project.projectId)) {
        setSelectedProjectIds(selectedProjectIds.filter((id) => id !== project.projectId));
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

      if (JSON.stringify(filteredSelectedProjectIds) !== JSON.stringify(filteredProjectIdsToDelete)) {
        console.log("calling apis")
        await assignOrgUserProject(uid, currentOrg, selectedProjectIds, role);
        await removeOrgUserProject(uid, currentOrg, projectIdsToDelete);
      }
      
      if (role !== initialRole) {
        await changeUserRole(uid, currentOrg, role);
      }
      
      onClose();
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
      await manageAccountsApi.assignOrgUserToProject(uid, currentOrg, projectIds, role, token);
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
      await manageAccountsApi.removeOrgUserFromProject(uid, currentOrg, projectIds, token);
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
  }

  const unlinkedProjects: { projectId: number; address: string }[] = orgProjects
  .filter((project) => !addresses.includes(project.address))
  .map((project) => ({
    projectId: Number(project.projectId),
    address: project.address,
  }));


  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-details-modal">
      <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh]">
        <IconButton
          onClick={onClose}
          className="absolute top-2 right-2 text-[#30525E]"
        >
          <CloseIcon />
        </IconButton>

        <div className="flex flex-col items-center justify-center">
          <img
            src="path_to_profile_picture.jpg"
            alt="Profile Picture"
            className="w-24 h-24 rounded-full border-2 border-black mb-2"
          />

          <Typography
            variant="h6"
            id="user-details-modal"
            className="text-[#30525E] font-sequel-sans-medium text-lg mb-2 pb-4"
          >
            {userName}
          </Typography>

          <div className="border p-2 rounded shadow-md w-full mb-4 flex items-center relative">
            <p className="mb-1 text-[#30525E] text-lg font-sequel-sans-medium">
              Role
            </p>
            <div className="flex-1 pl-12">
              {isEditingRole ? (
                <RoleEditForm
                  currentRole={role}
                  onRoleChange={handleRoleChange}
                  onSave={handleSaveRoleChange}
                />
              ) : (
                <div className="pl-12">
                  <span className="inline-block px-8 py-1 border border-[#30525E] rounded-full">
                    {role}
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
              className="mb-1 text-[#30525E] text-lg font-sequel-sans-medium text-left w-full pl-2"
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
                  <IconButton
                    className="text-red-600"
                    onClick={() => handleDeleteClick(address)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Save and Delete Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {/* Save button for both admin and master */}
          {(currentUserRole === "master" || currentUserRole === "admin") && (
            <div
              onClick={handleSave}
              className="w-[150px] h-[25px] px-[25px] py-5 bg-[#266472] rounded-[30px] border-2 border-[#266472] justify-center items-center gap-2.5 inline-flex cursor-pointer"
            >
              <div className="text-center text-white text-2xl font-['Sequel Sans']">
                Save
              </div>
            </div>
          )}
          {/* Delete button only for master */}
          {currentUserRole === "master" && (
            <div
              onClick={handleDeleteUserClick}
              className="w-[150px] h-[25px] px-[25px] py-5 bg-red-600 rounded-[30px] border-2 border-red-600 justify-center items-center gap-2.5 inline-flex cursor-pointer"
            >
              <div className="text-center text-white text-2xl font-['Sequel Sans']">
                Delete
              </div>
            </div>
          )}
        </div>

        {isDeletePopupOpen && (
          <DeleteConfirmationPopup
            addressToDelete={addressToDelete}
            userName={userName}
            onConfirm={handleConfirmDelete}
            isUserDeletion={isUserDeletion}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </Modal>
  );
}

export default UserInfoModal;
