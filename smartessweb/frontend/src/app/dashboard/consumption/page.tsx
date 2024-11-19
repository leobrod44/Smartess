'use client';

import CloseTicketModal from '@/app/components/IndividualTicketPageComponents/CloseTicketModal';
import DeleteTicketModal from '@/app/components/IndividualTicketPageComponents/DeleteTicketModal';
import { useProjectContext } from '@/context/ProjectProvider';
import { useEffect, useState } from 'react';

const ConsumptionPage = () => {
  const { selectedProjectId, selectedProjectAddress } = useProjectContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false); // State for CloseTicketModal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for DeleteTicketModal

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }


   // Handlers for CloseTicketModal
   const handleOpenCloseModal = () => setIsCloseModalOpen(true);
   const handleCloseCloseModal = () => setIsCloseModalOpen(false);
   const handleConfirmCloseTicket = () => {
     console.log("Ticket closed");
     setIsCloseModalOpen(false);
   };
 
   // Handlers for DeleteTicketModal
   const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
   const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
   const handleConfirmDeleteTicket = () => {
     console.log("Ticket deleted");
     setIsDeleteModalOpen(false);
   };

   
  return (
    <div>
      <h1>Consumption Page</h1>
      {selectedProjectId ? (
        <>
          <p>Selected Project ID: {selectedProjectId}</p>
          <p>Project Address: {selectedProjectAddress}</p>
        </>
      ) : (
        <>
            <div className="flex justify-center gap-10 mt-8">
          {/* Close Ticket Button */}
          <button
            className="px-3 py-1 items-center bg-[#4b7d8d] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
            onClick={handleOpenCloseModal}
          >
            Close Ticket
          </button>

          {/* Delete Ticket Button */}
          <button
            className="px-3 py-1 items-center bg-[#ff5449] rounded-md hover:bg-[#9b211b] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
            onClick={handleOpenDeleteModal}
          >
            Delete Ticket
          </button>
        </div>
        {/* Render CloseTicketModal */}
      {isCloseModalOpen && (
        <CloseTicketModal
          onBack={handleCloseCloseModal}
          onCloseTicket={handleConfirmCloseTicket}
        />
      )}

      {/* Render DeleteTicketModal */}
      {isDeleteModalOpen && (
        <DeleteTicketModal
          onBack={handleCloseDeleteModal}
          onDeleteTicket={handleConfirmDeleteTicket}
        />
      )}
        </>
      )}
    </div>
  );
};

export default ConsumptionPage;
