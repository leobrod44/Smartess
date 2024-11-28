"use client";

import { useEffect, useState } from "react";
import IndividualTicket from "@/app/components/IndividualTicketPageComponents/IndividualTicket";
import { generateMockProjects, Ticket, CurrentUser } from "@/app/mockData";
import BackArrowButton from "@/app/components/BackArrowBtn";
import ManageTicketAssignment from "@/app/components/IndividualTicketPageComponents/ManageTicketAssignment";
import CloseTicketModal from "@/app/components/IndividualTicketPageComponents/ConfirmationModals/CloseTicketModal";
import DeleteTicketModal from "@/app/components/IndividualTicketPageComponents/ConfirmationModals/DeleteTicketModal";
import { showToastError, showToastSuccess } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import { manageAccountsApi } from "@/api/page";

const IndividualTicketPage = ({ params }: { params: { ticketId: string } }) => {
  const router = useRouter();
  const { ticketId } = params;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();

  //get current logged in users role
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const responseCurrentUser = await manageAccountsApi.getCurrentUserApi(token);
        const tempCurrentUser = responseCurrentUser.currentUser;
        setCurrentUser({
          userId: tempCurrentUser.userId.toString(),
          role: tempCurrentUser.role,
          address: tempCurrentUser.address,
        });
      } catch (err) {
        console.error("Error fetching user role:", err);
      } finally {
        //setLoading(false);
      }
    };

    fetchData();

  }, [router]);


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

  // Handlers for the open and closed states of the close modal
  const handleOpenCloseTicketModal = () => setIsCloseModalOpen(true);
  const handleCloseCloseTicketModal = () => setIsCloseModalOpen(false);

  //handles actually closing the ticket..... logic should be added here
  const handleConfirmCloseTicket = () => {
    setIsCloseModalOpen(false);
    try {
      showToastSuccess("Ticket Closed successfully");
      // Change the status of ticket to closed 
      if (selectedTicket) {
        setSelectedTicket({
          ...selectedTicket,
          status: "closed",
        });
      }
    } catch (error) {
      showToastError(
        error instanceof Error
          ? error.message
          : "Could not close the ticket. Please try again later."
      );
    }
  };

  // Handlers for the open and closed states of the delete modal
  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  //handles actually deleting the ticket..... logic should be added here
  const handleConfirmDeleteTicket = () => {
    setIsDeleteModalOpen(false);
    try {
      showToastSuccess("Ticket Deleted successfully");
      setTimeout(() => {
        router.push("../ticket");
      }, 500);
    } catch (error) {
      showToastError(
        error instanceof Error
          ? error.message
          : "Could not delete the ticket. Please try again later."
      );
    }
  };

  // Handler to update the ticket status when a user is assigned or unassigned
  const handleStatusUpdate = (newStatus: "open" | "pending" | "closed") => {
    if (selectedTicket) {
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus, // Update the status based on user assignment
      });
    }
  };

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen flex flex-col">
        <div className="flex items-center justify-between pb-4">
          <div className="text-[#325a67] text-[30px] leading-10 tracking-tight">
            Ticket Information
          </div>
          <BackArrowButton />
        </div>

        {selectedTicket ? (
          <>
            <IndividualTicket ticket={selectedTicket} />
            { currentUser && currentUser.role !== "basic" && (
              <>
                <div className="text-[#325a67] text-[30px] leading-10 tracking-tight pt-10 pb-5">
                  Manage Ticket Assignment
                </div>
                <ManageTicketAssignment
                  ticket={selectedTicket}
                  onStatusUpdate={handleStatusUpdate} 
                />
              </>
            )}

            <div className="flex justify-center gap-10 mt-8">
              { currentUser && currentUser.role !== "basic" && selectedTicket.status !== "closed" && (
                <button
                  className="px-3 py-1 items-center bg-[#4b7d8d] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                  onClick={handleOpenCloseTicketModal}
                >
                  Close Ticket
                </button>
              )}

              {currentUser &&  currentUser.role !== "basic" ? (
                <button
                  className="px-3 py-1 items-center bg-[#ff5449] rounded-md hover:bg-[#9b211b] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                  onClick={handleOpenDeleteModal}
                >
                  Delete Ticket
                </button>
              ) : (
                selectedTicket.status === "closed" && (
                  <div className="flex justify-center mt-4">
                    <button
                      className="px-3 py-1 bg-[#ff5449] rounded-md hover:bg-[#9b211b] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                      onClick={handleOpenDeleteModal}
                    >
                      Delete Ticket
                    </button>
                  </div>
                )
              )}
            </div>

            {isCloseModalOpen && (
              <CloseTicketModal
                onBack={handleCloseCloseTicketModal}
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
