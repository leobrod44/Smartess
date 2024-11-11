import React from "react";

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
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-red-500 rounded-lg shadow-lg p-6 z-30">
      <p className="text-center text-black mb-4">
        {isUserDeletion
          ? `Are you sure you want to delete ${userName}?`
          : `Are you sure you want to delete "${addressToDelete}" from ${userName}?`}
      </p>
      <div className="flex justify-center gap-4">
        <div
          onClick={onConfirm}
          className="w-[113px] h-[25px] px-[25px] py-5 bg-[#b3261e] rounded-[30px] border-2 border-[#b3261e] justify-center items-center gap-2.5 inline-flex cursor-pointer hover:bg-[#9b211b] hover:border-[#9b211b] transition-colors"
        >
          <div className="text-center text-white text-2xl font-['Sequel Sans']">
            Delete
          </div>
        </div>
        <div
          onClick={onCancel}
          className="w-[113px] h-[25px] px-[25px] py-5 bg-[#cccccc] rounded-[30px] border-2 border-[#cccccc] justify-center items-center gap-2.5 inline-flex cursor-pointer hover:bg-[#b3b3b3] hover:border-[#b3b3b3] transition-colors"
        >
          <div className="text-center text-white text-2xl font-['Sequel Sans']">
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationPopup;
