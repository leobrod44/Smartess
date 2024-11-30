import React from "react";

const ResolveTicketModal = ({
  isOpen,
  onClose,
  onConfirm,
  ticketName,
  isResolved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticketName: string;
  isResolved: boolean;
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
          {isResolved ? "Mark as Unresolved" : "Mark as Resolved"}
        </h2>
        <p className="text-[#254752] text-xs mb-5">
          Are you sure you want to mark the ticket{" "}
          <strong className="text-gray-900">{ticketName}</strong> as{" "}
          {isResolved ? "unresolved" : "resolved"}?
        </p>
        <div className="flex justify-around">
          {/* Cancel Button */}
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* Confirm Button */}
          <button
            className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolveTicketModal;
