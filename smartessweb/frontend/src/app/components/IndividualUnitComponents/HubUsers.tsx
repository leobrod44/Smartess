"use client";
import React, { useState } from "react";
import { HubUser } from "../../mockData";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import DeleteConfirmation from "../ManageUsersComponents/DeleteConfirmation";
import { individualUnitApi } from "@/api/page";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

interface HubUsersProps {
  hubUsers: HubUser[];
  currentUserRole: "master" | "admin" | "basic";
}

const HubUsers = ({ hubUsers, currentUserRole }: HubUsersProps) => {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HubUser | null>(null);
  const token = localStorage.getItem("token");
  const [activeHubUsers, setActiveHubUsers] = useState<HubUser[]>(hubUsers);

  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handleDeleteClick = (user: HubUser) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleConfirmDelete = () => {
    removeUserFromHub(selectedUser);
    setIsPopupOpen(false);
    setSelectedUser(null);
  };

  const removeUserFromHub = async (user: HubUser | null) => {
    try {
      if (!token) {
        router.push("/sign-in");
        return;
      }

      await individualUnitApi.removeUserFromHub(user?.tokenId, token);
    } catch (err) {
      console.error("Error removing user:", err);
    }
    if (user) {
      setActiveHubUsers((prevUsers) =>
        prevUsers.filter((hubUser) => hubUser.tokenId !== user.tokenId)
      );
    }
  };

  const handleCancelDelete = () => {
    setIsPopupOpen(false);
    setSelectedUser(null);
  };

  const gridColsClass =
    currentUserRole === "basic" ? "md:grid-cols-4" : "md:grid-cols-5";

  return (
    <div className="relative">
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Users
      </div>

      {/* Table Headers */}
      <div
        className={`hidden md:grid ${gridColsClass} w-full text-center text-[#14323B] font-semibold text-sm mb-2`}
      >
        <div>User</div>
        <div>Telephone</div>
        <div>Email</div>
        <div>Contact</div>
        {currentUserRole === "master" || currentUserRole === "admin" ? (
          <div>Actions</div>
        ) : null}
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      <div className="flex flex-col gap-6 overflow-y-auto max-h-[300px] custom-scrollbar scrollbar-thumb-[#4b7d8d] scrollbar-track-gray-200">
        {activeHubUsers.map((user, index) => (
          <div
            key={index}
            className={`md:grid ${gridColsClass} w-full text-center text-black text-sm gap-4 px-2`}
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center rounded-lg border p-2">
              <div className="text-[#14323B] font-semibold">User:</div>{" "}
              {capitalizeWords(`${user.firstName} ${user.lastName}`)}
              <div className="text-[#14323B] font-semibold">
                Telephone:
              </div>{" "}
              {user.telephone
                ? `${user.telephone.slice(0, 3)}-${user.telephone.slice(
                    3,
                    6
                  )}-${user.telephone.slice(6)}`
                : "Not Provided"}
              <div className="text-[#14323B] font-semibold">Email:</div>{" "}
              {user.email}
              <div className="flex justify-center my-2">
                <button className="w-[80px] h-[22px] flex items-center justify-center gap-2 bg-[#4b7d8d] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
                  Contact
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                </button>
              </div>
              {currentUserRole === "master" || currentUserRole === "admin" ? (
                <div>
                  <div className="text-[#14323B] font-semibold mt-5">Actions:</div>
                  <button>
                    <TrashIcon
                      onClick={() => handleDeleteClick(user)}
                      className="h-5 w-5 mx-auto text-red-500 hover:text-red-900  "
                    />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:flex items-center justify-center">
              {capitalizeWords(`${user.firstName} ${user.lastName}`)}
            </div>
            <div className="hidden md:flex items-center justify-center">
              {user.telephone
                ? `${user.telephone.slice(0, 3)}-${user.telephone.slice(
                    3,
                    6
                  )}-${user.telephone.slice(6)}`
                : "Not Provided"}
            </div>
            <div
              className="hidden md:flex items-center justify-center  "
              title={user.email} // Show full email on hover
            >
              {user.email}
            </div>
            <div className="hidden md:flex items-center justify-center">
              <button className="w-[80px] h-[22px] flex items-center justify-center gap-2 bg-[#4b7d8d] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
                Contact
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:flex items-center justify-center">
              {currentUserRole === "master" || currentUserRole === "admin" ? (
                <button onClick={() => handleDeleteClick(user)}>
                  <TrashIcon className="h-5 w-5 mx-auto text-red-500 hover:text-red-900  " />
                </button>
              ) : null}
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
