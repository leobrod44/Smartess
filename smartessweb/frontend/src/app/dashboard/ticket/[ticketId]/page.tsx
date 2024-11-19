"use client";

import { useEffect, useState } from "react";
import IndividualTicket from "@/app/components/IndividualTicketPageComponents/IndividualTicket";
import { generateMockProjects, Ticket } from "@/app/mockData"; // Adjusted the import path for mockData
import BackArrowButton from "@/app/components/BackArrowBtn";
import ManageTicketAssignment from "@/app/components/IndividualTicketPageComponents/ManageTicketAssignment";
import CloseTicketModal from "@/app/components/IndividualTicketPageComponents/CloseTicketModal";
import DeleteTicketModal from "@/app/components/IndividualTicketPageComponents/DeleteTicketModal";

const IndividualTicketPage = ({ params }: { params: { ticketId: string } }) => {
  const { ticketId } = params;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Fetch the specific ticket based on ticketId from mock data
    const projects = generateMockProjects();
    let foundTicket = null;

    for (const project of projects) {
      for (const unit of project.units) {
        const ticket = unit.ticket.find((t) => t.ticket_id === ticketId);
        if (ticket) {
          foundTicket = ticket;
          break;
        }
      }
      if (foundTicket) break;
    }

    setSelectedTicket(foundTicket);
  }, [ticketId]);

  // Handlers for CloseTicketModal
  const handleOpenCloseModal = () => {
    console.log("Close ticket Button Clicked");
    setIsCloseModalOpen(true);
  };
  const handleCloseCloseModal = () => setIsCloseModalOpen(false);
  const handleConfirmCloseTicket = () => {
    console.log("Ticket closed");
    setIsCloseModalOpen(false);
  };

  // Handlers for DeleteTicketModal
  const handleOpenDeleteModal = () => {
    console.log("Delete ticket Button Clicked");
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
  const handleConfirmDeleteTicket = () => {
    console.log("Ticket deleted");
    setIsDeleteModalOpen(false);
  };

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
        <div className="flex items-center justify-between pb-4">
          <div className="text-[#325a67] text-[30px] leading-10 tracking-tight">
            Ticket Information
          </div>
          <BackArrowButton />
        </div>

        {selectedTicket ? (
          <>
            <IndividualTicket ticket={selectedTicket} />
            <div className="text-[#325a67] text-[30px] leading-10 tracking-tight pt-10 pb-5">
              Manage Ticket Assignment
            </div>
            <ManageTicketAssignment ticket={selectedTicket} />
            <div className="flex justify-center gap-10 mt-8">
              <button
                className="px-3 py-1 items-center bg-[#4b7d8d] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                onClick={handleOpenCloseModal}
              >
                Close Ticket
              </button>
              <button
                className="px-3 py-1 items-center bg-[#ff5449] rounded-md hover:bg-[#9b211b] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                onClick={handleOpenDeleteModal}
              >
                Delete Ticket
              </button>
            </div>

            {isCloseModalOpen && (
              <CloseTicketModal
                onBack={handleCloseCloseModal}
                onCloseTicket={handleConfirmCloseTicket}
              />
            )}

            {isDeleteModalOpen && (
              <DeleteTicketModal
                onBack={handleCloseDeleteModal}
                onDeleteTicket={handleConfirmDeleteTicket}
              />
            )}
          </>
        ) : (
          <p>Loading ticket details...</p>
        )}
      </div>
    </div>
  );
};

export default IndividualTicketPage;
