import React from "react";

const DeleteTicketModal = ({
  isOpen,
  onClose,
  onDelete,
  ticketName,
  userType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  ticketName: string;
  userType: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-[#254752] text-s font-sequel-sans-black mb-4">
          Delete Ticket
        </h2>
        <div className="text-[#254752] text-xs mb-5">
          {userType === "basic" ? (
            <p>
              You are a <strong className="text-gray-900">basic user</strong>{" "}
              and do not have permission to delete the ticket{" "}
              <strong className="text-gray-900">{ticketName}</strong>.
            </p>
          ) : (
            <p>
              Are you sure you want to delete the ticket{" "}
              <strong className="text-gray-900">{ticketName}</strong>? This
              action cannot be undone.
            </p>
          )}
        </div>
        <div className="flex justify-around">
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          {userType !== "basic" && (
            <button
              className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteTicketModal;
