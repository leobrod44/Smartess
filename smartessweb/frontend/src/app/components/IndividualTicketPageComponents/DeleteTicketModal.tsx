const DeleteTicketModal = ({
  onBack,
  onDeleteTicket,
}: {
  onBack: () => void;
  onDeleteTicket: () => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 lg:ml-[25%] xl:ml-[25%]">
        <div className="text-[#254752] text-s font-sequel-sans-black mb-4">
          Are you sure you want to delete this ticket?
        </div>
        <div className="text-[#254752] text-xs mb-5">
          Deleting this ticket will permanently delete its contents.
        </div>

        <div className="flex justify-around">
          <button
            className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
            onClick={onDeleteTicket} // Call the prop function
          >
            Delete Ticket
          </button>
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onBack} // Call the prop function
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTicketModal;