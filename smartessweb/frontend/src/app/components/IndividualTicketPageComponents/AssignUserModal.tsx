import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import CondensedUserComponent from "./CondensedUserComponent";
import { Individual } from "@/app/mockData";

interface AssignUserModalProps {
  onClose: () => void;
  availableUsers: Individual[];
  onAssignUser: (userId: string, isAssigned: boolean) => void;
}

const AssignUserModalComponent = ({
  onClose,
  availableUsers,
  onAssignUser,
}: AssignUserModalProps) => {
  const handleToggleAssign = (userId: string, newState: boolean) => {
    onAssignUser(userId, newState);
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className=" w-[500px] relative border-2 bg-white border-[#266472] rounded-md px-5 py-5 flex-col gap-3 inline-flex">
        <CloseIcon
          className="absolute top-2 right-2 text-gray-400 cursor-pointer hover:text-gray-600 transition duration-300"
          onClick={onClose}
          fontSize="small"
        />

        <div className="w-full text-center text-[#14323b] text-lg font-['Sequel Sans'] my-2">
          Users Available for Assignment
        </div>

        <div className="w-full flex justify-between flex items-center text-[#266472]">
          <div className="w-1/4 text-s leading-tight tracking-tight whitespace-nowrap">
            User ID
          </div>
          <div className="w-1/2 text-s leading-tight tracking-tight whitespace-nowrap">
            Name
          </div>
          <div className="w-1/4 text-s leading-tight tracking-tight whitespace-nowrap">
            Assign User
          </div>
        </div>

        {availableUsers.slice(0, 4).map((user) => (
          <CondensedUserComponent
            key={user.individualId}
            Individual={user}
            isAssigned={false}
            onToggle={(newState) =>
              handleToggleAssign(user.individualId, newState)
            }
          />
        ))}
        <div className="flex justify-center items-center mt-3 w-full">
          <button
            className="px-4 py-2 bg-[#266472] rounded-md text-center text-white text-s font-['Sequel Sans'] leading-tight tracking-tight hover:bg-[#14323b] transition duration-300"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignUserModalComponent;
