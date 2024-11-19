const CloseTicketModal = ({
  onBack,
  onCloseTicket,
}: {
  onBack: () => void;
  onCloseTicket: () => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8  lg:ml-[25%] xl:ml-[25%]">
        <div className="text-[#254752] text-s font-sequel-sans-black mb-4">
          Are you sure you want to close this ticket?
        </div>
        <div className="text-[#254752] text-xs mb-5">
          Closing this ticket will change its status and unassign all employees
          currently assigned.
        </div>

        <div className="flex justify-around">
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onCloseTicket}
          >
            Close Ticket
          </button>
          <button
            className="bg-[#4b7d8d] text-white text-xs  w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseTicketModal;
