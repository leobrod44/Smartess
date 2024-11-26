import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CondensedUserComponent from "./CondensedUserComponent";
import { Individual } from "@/app/mockData";
import Pagination from "@mui/material/Pagination";
import Searchbar from "@/app/components/Searchbar";
import { showToastError } from "../Toast";

interface AssignUserModalProps {
  onClose: () => void;
  availableUsers: Individual[];
  onSave: (selectedUsers: Individual[]) => void;
  remainingSlots: number;
}

const AssignUserModalComponent = ({
  onClose,
  availableUsers,
  onSave,
  remainingSlots,
}: AssignUserModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [toggledUsers, setToggledUsers] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleToggleAssign = (userId: number, newState: boolean) => {
    const selectedCount = Object.values(toggledUsers).filter(Boolean).length;

    if (newState && selectedCount >= remainingSlots) {
      showToastError(`You can only add up to ${remainingSlots} user(s).`);
      return;
    }
    setToggledUsers((prev) => ({ ...prev, [userId]: newState }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredUsers = availableUsers.filter(
    ({ firstName, lastName, individualId }) => {
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      const idMatch = individualId.toString().includes(query);

      return fullName.includes(query) || idMatch;
    }
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSave = () => {
    const selectedUsers = availableUsers.filter(
      (user) => toggledUsers[user.individualId]
    );
    onSave(selectedUsers); // Pass selected users to parent
    onClose(); // Close the modal
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
        <Searchbar onSearch={handleSearch} />

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

        {currentItems.map((user) => (
          <CondensedUserComponent
            key={user.individualId}
            Individual={user}
            isAssigned={!!toggledUsers[user.individualId]}
            onToggle={(newState) =>
              handleToggleAssign(user.individualId, newState)
            }
          />
        ))}

        <div className="mt-4 flex justify-center">
          <Pagination
            className="custom-pagination"
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>

        <div className="flex justify-center items-center mt-3 w-full">
          <button
            className="px-4 py-2 bg-[#266472] rounded-md text-center text-white text-s font-['Sequel Sans'] leading-tight tracking-tight hover:bg-[#14323b] transition duration-300"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignUserModalComponent;
