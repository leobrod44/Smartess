"use client";
import React, { useState } from "react";
import { HubUser } from "../../mockData";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmation from "../ManageUsersComponents/DeleteConfirmation";

interface HubUsersProps {
  hubUsers: HubUser[];
}

const HubUsers = ({ hubUsers }: HubUsersProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HubUser | null>(null);

  const handleDeleteClick = (user: HubUser) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log(
      `Deleted user: ${selectedUser?.firstName} ${selectedUser?.lastName}`
    );
    setIsPopupOpen(false);
    setSelectedUser(null);
  };

  const handleCancelDelete = () => {
    setIsPopupOpen(false);
    setSelectedUser(null);
  };
  return (
    <div className="relative">
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Users
      </div>

      {/* Table Headers */}
      <div className="hidden md:grid md:grid-cols-5 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>User</div>
        <div>Telephone</div>
        <div>Email</div>
        <div>Contact</div>
        <div>Actions</div>
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      <div className="flex flex-col gap-6 overflow-y-auto max-h-[300px] custom-scrollbar scrollbar-thumb-[#4b7d8d] scrollbar-track-gray-200">
        {hubUsers.map((user, index) => (
          <div
            key={index}
            className="md:grid md:grid-cols-5 w-full text-center text-black text-sm gap-4 px-2"
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center">
              <div className="text-[#14323B] font-semibold">User:</div>{" "}
              {user.firstName} {user.lastName}
              <div className="text-[#14323B] font-semibold">
                Telephone:
              </div>{" "}
              {user.telephone || "Not Provided"}
              <div className="text-[#14323B] font-semibold">Email:</div>{" "}
              {user.email}
              <p>
                <button className="ml-2 mt-2 w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
                  Contact
                </button>
              </p>
              <div className="text-[#14323B] font-semibold">Actions:</div>
              <button>
                <DeleteIcon
                  onClick={() => handleDeleteClick(user)}
                  className="text-[#e63946] hover:text-[#a22233] transition duration-300 cursor-pointer"
                />
              </button>
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:flex items-center justify-center">
              {user.firstName} {user.lastName}
            </div>
            <div className="hidden md:flex items-center justify-center">
              {user.telephone || "Not Provided"}
            </div>
            <div
              className="hidden md:flex items-center justify-center  "
              title={user.email} // Show full email on hover
            >
              {user.email}
            </div>
            <div className="hidden md:flex items-center justify-center">
              <button className="w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
                Contact
              </button>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <button onClick={() => handleDeleteClick(user)}>
                <DeleteIcon className="text-[#e63946] hover:text-[#a22233] transition duration-300 cursor-pointer" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {isPopupOpen && selectedUser && (
        <DeleteConfirmation
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          isUserDeletion={true}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default HubUsers;
