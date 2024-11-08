import React, { useState } from "react";
import { Modal, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DeleteConfirmationPopup from "./DeleteConfirmation";
import RoleEditForm from "./RoleEditForm";
import ProjectAddressMenu from "./ProjectAddressMenu";
import { generateMockProjects } from "../mockData";

interface UserInfoModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  role: "admin" | "basic" | "master";
  addresses: string[];
  currentUserRole: "admin" | "basic" | "master";
}

function UserInfoModal({
  open,
  onClose,
  userName,
  role: initialRole,
  addresses: initialAddresses,
  currentUserRole,
}: UserInfoModalProps) {
  const [role, setRole] = useState<"admin" | "basic" | "master">(initialRole);
  const [addresses, setAddresses] = useState<string[]>(initialAddresses);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isProjectMenuOpen, setProjectMenuOpen] = useState(false);

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
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      const updatedAddresses = addresses.filter(
        (addr) => addr !== addressToDelete
      );
      setAddresses(updatedAddresses);
      setDeletePopupOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletePopupOpen(false);
  };

  const handleAddClick = () => {
    setProjectMenuOpen(!isProjectMenuOpen);
  };

  const handleAddressSelect = (address: string) => {
    setAddresses((prevAddresses) => [...prevAddresses, address]);
    setProjectMenuOpen(false); // Close the dropdown after selection
  };

  const unlinkedAddresses: string[] = generateMockProjects()
    .map((project) => project.address)
    .filter((address) => !addresses.includes(address));

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
              !isEditingRole && (
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
              unlinkedAddresses={unlinkedAddresses}
              onSelectAddress={handleAddressSelect}
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

        {isDeletePopupOpen && (
          <DeleteConfirmationPopup
            addressToDelete={addressToDelete}
            userName={userName}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </Modal>
  );
}

export default UserInfoModal;
