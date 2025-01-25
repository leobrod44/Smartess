"use client";

import { useEffect, useState } from "react";
import IndividualTicket from "@/app/components/IndividualTicketPageComponents/IndividualTicket";
import { Ticket, CurrentUser } from "@/app/mockData";
import BackArrowButton from "@/app/components/BackArrowBtn";
import ManageTicketAssignment from "@/app/components/IndividualTicketPageComponents/ManageTicketAssignment";
import CloseTicketModal from "@/app/components/IndividualTicketPageComponents/ConfirmationModals/CloseTicketModal";
import DeleteTicketModal from "@/app/components/IndividualTicketPageComponents/ConfirmationModals/DeleteTicketModal";
import { showToastError, showToastSuccess } from "@/app/components/Toast";
import { useRouter } from "next/navigation";
import { manageAccountsApi } from "@/api/page";
import { ticketsApi } from "@/api/dashboard/ticket/[ticketid]/page";

const transformType = (type: string): "alert" | "repair" | "bug" | "other" => {
 const lowercaseType = type.toLowerCase();
 switch (lowercaseType) {
   case "alert": return "alert";
   case "repair": return "repair";
   case "bug": return "bug";
   default: return "other";
 }
};

const transformStatus = (status: string): "open" | "pending" | "closed" => {
 const lowercaseStatus = status.toLowerCase();
 switch (lowercaseStatus) {
   case "open": return "open";
   case "pending": return "pending";
   case "closed": return "closed";
   default: return "open";
 }
};

const IndividualTicketPage = ({ params }: { params: { ticketId: string } }) => {
 const router = useRouter();
 const { ticketId } = params;
 const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
 const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [currentUser, setCurrentUser] = useState<CurrentUser>();
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   const fetchData = async () => {
     const token = localStorage.getItem("token");
     if (!token) {
       router.push("/sign-in");
       return;
     }

     try {
       const responseCurrentUser = await manageAccountsApi.getCurrentUserApi(token);
       setCurrentUser({
         userId: responseCurrentUser.currentUser.userId.toString(),
         role: responseCurrentUser.currentUser.role,
         address: responseCurrentUser.currentUser.address,
         firstName: responseCurrentUser.currentUser.firstName,
         lastName: responseCurrentUser.currentUser.lastName,
       });

       const { ticket } = await ticketsApi.getIndividualTicket(token, ticketId);
       setSelectedTicket({
         ticket_id: ticket.ticket_id,
         unit_id: ticket.unit_id,
         unit_number: ticket.unit || "",
         project_address: ticket.project_address,  
         title: ticket.name,
         description: ticket.description,
         type: transformType(ticket.type),
         status: transformStatus(ticket.status),
         created_at: new Date(ticket.created_at),
         submitted_by_firstName: ticket.submitted_by_firstName,
         submitted_by_lastName: ticket.submitted_by_lastName,
         submitted_by_email: ticket.submitted_by_email,
         assigned_employees: []
       });
       setError(null);
     } catch (err) {
       setError(err instanceof Error ? err.message : "An error occurred");
       console.error("Error fetching data:", err);
     } finally {
       setIsLoading(false);
     }
   };

   fetchData();
 }, [ticketId, router]);

 const handleOpenCloseTicketModal = () => setIsCloseModalOpen(true);
 const handleCloseCloseTicketModal = () => setIsCloseModalOpen(false);

 const handleConfirmCloseTicket = () => {
   setIsCloseModalOpen(false);
   try {
     showToastSuccess("Ticket Closed successfully");
     if (selectedTicket) {
       setSelectedTicket({
         ...selectedTicket,
         status: "closed",
       });
     }
   } catch (error) {
     showToastError(error instanceof Error ? error.message : "Could not close the ticket. Please try again later.");
   }
 };

 const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
 const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

 const handleConfirmDeleteTicket = async () => {
   setIsDeleteModalOpen(false);
   const token = localStorage.getItem("token");
   if (!token || !selectedTicket) return;

   try {
     await ticketsApi.deleteTicket(token, selectedTicket.ticket_id);
     showToastSuccess("Ticket Deleted successfully");
     setTimeout(() => {
       router.push("../ticket");
     }, 500);
   } catch (error) {
     showToastError(error instanceof Error ? error.message : "Could not delete the ticket. Please try again later.");
   }
 };

 const handleStatusUpdate = (newStatus: "open" | "pending" | "closed") => {
   if (selectedTicket) {
     setSelectedTicket({
       ...selectedTicket,
       status: newStatus,
     });
   }
 };

 if (isLoading) {
   return <div className="flex justify-center items-center h-screen">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
   </div>;
 }

 if (error) {
   return <div className="flex justify-center items-center h-screen">
     <div className="text-red-500 text-center">
       <p className="text-xl font-semibold">Error loading ticket</p>
       <p className="text-sm">{error}</p>
     </div>
   </div>;
 }

 return (
   <div>
     <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen flex flex-col">
       <div className="flex items-center justify-between pb-4">
         <div className="text-[#325a67] text-[30px] leading-10 tracking-tight">
           Ticket Information
         </div>
         <BackArrowButton />
       </div>

       {selectedTicket && (
         <>
           <IndividualTicket ticket={selectedTicket} />
           {currentUser && currentUser.role !== "basic" && (
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

           <div className="flex justify-center mt-auto gap-10 ">
             {currentUser &&
               currentUser.role !== "basic" &&
               selectedTicket.status !== "closed" && (
                 <button
                   className="px-3 py-1 items-center bg-[#4b7d8d] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                   onClick={handleOpenCloseTicketModal}
                 >
                   Close Ticket
                 </button>
               )}

             {currentUser && currentUser.role !== "basic" ? (
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
       )}
     </div>
   </div>
 );
};

export default IndividualTicketPage;