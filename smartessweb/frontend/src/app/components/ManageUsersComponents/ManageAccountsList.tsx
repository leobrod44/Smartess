"use client";
import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import UserInfoModal from "../ManageUsersComponents/UserInfoModal";
interface ManageAccountsListProps {
  address: string;
  userName: string;
  permission: "admin" | "basic" | "master";
  currentUserRole: "admin" | "basic" | "master"; // Current user's role
  addresses: string[];
}

const ManageAccountsList = ({
  address,
  userName,
  permission,
  currentUserRole,
  addresses, // Destructure addresses
}: ManageAccountsListProps) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getColorClasses = () => {
    switch (permission) {
      case "basic":
        return "bg-[#A6634F] text-white";
      case "admin":
        return "bg-[#729987] text-white";
      case "master":
        return "bg-[#CCCCCC] text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <>
      <div
        className="account-card border p-4 rounded shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200"
        onClick={handleOpenModal}
      >
        <div className="flex-1">
          <p>{address}</p>
        </div>
        <div className="flex-1">
          <p>{userName}</p>
        </div>
        <div className="flex-1">
          <div
            className={`w-[78px] h-8 px-5 rounded-[20px] flex items-center justify-center ${getColorClasses()}`}
          >
            <p className="text-sm font-medium">{permission}</p>
          </div>
        </div>

        {/* Render the edit icon only if the current user has the "master" or "admin" role */}
        {(currentUserRole === "master" || currentUserRole === "admin") && (
          <div className="ml-4" onClick={handleOpenModal}>
            <EditIcon className="text-[#30525E] cursor-pointer" />
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserInfoModal
        open={isModalOpen}
        onClose={handleCloseModal}
        userName={userName}
        role={permission}
        addresses={addresses}
        currentUserRole={currentUserRole} // Pass currentUserRole for role-based logic
      />
    </>
  );
};

export default ManageAccountsList;
