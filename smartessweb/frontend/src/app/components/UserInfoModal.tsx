import React, { useState } from "react";
import { Modal, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RoleEditForm from "./RoleEditForm";

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
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isEditingRole, setIsEditingRole] = useState(false);

  const handleEditRoleClick = () => {
    setIsEditingRole(!isEditingRole);
  };

  const handleRoleChange = (newRole: "admin" | "basic" | "master") => {
    setRole(newRole); // Update the role state
    setIsEditingRole(false); // Hide the role editing form
  };

  // Function to handle address deletion
  const handleDeleteAddress = (index: number) => {
    // Create a new array without the deleted address
    const updatedAddresses = addresses.filter(
      (_, addrIndex) => addrIndex !== index
    );
    setAddresses(updatedAddresses); // Update the addresses state
  };
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="user-details-modal">
      <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh]">
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          className="absolute top-2 right-2 text-[#30525E]"
        >
          <CloseIcon />
        </IconButton>

        {/* Modal Content */}
        <div className="flex flex-col items-center justify-center">
          {/* Profile Picture */}
          <img
            src="path_to_profile_picture.jpg" // Replace with the actual image URL
            alt="Profile Picture"
            className="w-24 h-24 rounded-full border-2 border-black mb-2"
          />

          {/* User Details */}
          <Typography
            variant="h6"
            id="user-details-modal"
            className="text-[#30525E] font-sequel-sans-medium text-lg mb-2 pb-4"
          >
            {userName}
          </Typography>

          <div className="border p-2 rounded shadow-md w-full mb-4 flex items-center">
            <p className="mb-1 text-[#30525E] text-lg font-sequel-sans-medium">
              Role
            </p>
            <div className="flex-1 text-center pr-12">
              <span className="inline-block px-8 py-1 border border-[#30525E] rounded-full">
                {role}
              </span>
            </div>
            {/* Edit Icon (only visible for 'master' or 'admin' roles) */}
            {(currentUserRole === "master" || currentUserRole === "admin") && (
              <IconButton
                className="ml-4 text-[#30525E] relative z-10"
                onClick={handleEditRoleClick}
              >
                <EditIcon />
              </IconButton>
            )}

            {/* Conditionally Render RoleEditForm */}
            {isEditingRole && (
              <div className="absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-[#266472] rounded-lg shadow-lg p-4 z-20">
                <RoleEditForm
                  currentRole={role}
                  onRoleChange={handleRoleChange}
                />
              </div>
            )}
          </div>
          <Typography
            variant="body1"
            className="mb-1 text-[#30525E] text-lg font-sequel-sans-medium text-left w-full pl-2"
          >
            <strong>Projects</strong>
          </Typography>

          <div className="flex flex-col gap-2 w-full">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="account-card border p-2 rounded shadow-md flex items-center justify-start"
              >
                <p className="flex-1">{address}</p>
                {currentUserRole === "master" && (
                  <IconButton
                    className="text-red-600"
                    onClick={() => handleDeleteAddress(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
