import React from "react";
import CloseIcon from "@mui/icons-material/Close";

interface DeleteConfirmationPopupProps {
  addressToDelete?: string | null;
  userName: string;
  isUserDeletion?: boolean; //New prop to differentiate between user and project deletion
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationPopup({
  addressToDelete,
  userName,
  isUserDeletion = false, // Default to false for project deletion
  onConfirm,
  onCancel,
}: DeleteConfirmationPopupProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-xl shadow-lg p-8">
        <CloseIcon
          className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gray-700 transition duration-300"
          onClick={onCancel}
        />
        <div className="text-[#254752] text-s font-sequel-sans-black mb-4 text-center">
          {isUserDeletion
            ? `Are you sure you want to delete ${userName}?`
            : `Are you sure you want to delete "${addressToDelete}" from ${userName}?`}
        </div>
        <div className="text-[#254752] text-xs mb-5 text-center">
          Deleting this will permanently remove its contents.
        </div>

        <div className="flex justify-around">
          <button
            className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationPopup;
