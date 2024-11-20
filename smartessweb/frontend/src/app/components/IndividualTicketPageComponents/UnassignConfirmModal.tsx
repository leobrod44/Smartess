const UnassignConfirmModal = ({
  fullName,
  onBack,
  onUnassignTicket,
}: {
  fullName: string;
  onBack: () => void;
  onUnassignTicket: () => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-[#254752] text-sm font-sequel-sans  mb-4">
          Are you sure you want to unassign{" "}
          <span className="font-sequel-sans-black">{fullName}</span> from this
          ticket?
        </div>

        <div className="flex justify-around">
          <button
            className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
            onClick={onUnassignTicket}
          >
            Unassign
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

export default UnassignConfirmModal;
