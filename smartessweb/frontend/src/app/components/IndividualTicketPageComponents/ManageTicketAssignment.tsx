import React, { useState, useEffect } from "react";
import { Individual, Ticket, CurrentUser } from "../../mockData";
import AssignedUser from "./UserComponents/AssignedUserComponent";
import AssignUserModalComponent from "./AssignUserModal";
import { showToastError, showToastSuccess } from "../Toast";
import AssignedUserClosedTicket from "./UserComponents/AssignedUserClosedComponent";
import { useRouter } from "next/navigation";
import { manageAccountsApi } from "@/api/page";

interface ManageTicketProps {
 ticket: Ticket;
 onStatusUpdate: (newStatus: "open" | "pending" | "closed") => void;
}

function ManageTicketAssignment({ ticket, onStatusUpdate }: ManageTicketProps) {
 const router = useRouter();
 const assignedUsers = ticket.assigned_employees;
 const [isModalOpen, setIsModalOpen] = useState(false);
 const MAX_USERS = 3;
 const [availableUsers, setAvailableUsers] = useState<Individual[]>([]);
 const [currentUser, setCurrentUser] = useState<CurrentUser>();

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
         firstName: tempCurrentUser.firstName,
         lastName: tempCurrentUser.lastName,
       });
     } catch (err) {
       console.error("Error fetching user role:", err);
     }
   };
   fetchData();
 }, [router]);

 useEffect(() => {
   const fetchAvailableUsers = async () => {
     try {
       const token = localStorage.getItem('token');
       const response = await fetch(`http://localhost:3000/api/tickets/assignable-employees/${ticket.ticket_id}`, {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         }
       });

       if (!response.ok) throw new Error('Failed to fetch assignable employees');

       const data = await response.json();
       const formattedUsers: Individual[] = data.employees.map((emp: any) => ({
         individualId: emp.employeeId,
         firstName: emp.firstName,
         lastName: emp.lastName,
         role: emp.role
       }));
       
       setAvailableUsers(formattedUsers);
     } catch (error) {
       console.error('Error:', error);
       showToastError('Failed to load available employees');
     }
   };

   fetchAvailableUsers();
 }, [ticket.ticket_id]);

 useEffect(() => {
   if (assignedUsers.length === 0 && ticket.status !== "closed") {
     onStatusUpdate("open");
   }
 }, [assignedUsers, onStatusUpdate, ticket.status]);

 const handleOpenModal = () => {
   setIsModalOpen(true);
 };

 const handleCloseModal = () => {
   setIsModalOpen(false);
 };

 const handleAssignUser = (selectedUsers: Individual[]) => {
   try {
     if (assignedUsers.length + selectedUsers.length > MAX_USERS) {
       showToastError(`Cannot assign more than ${MAX_USERS} users to this ticket.`);
       return;
     }

     selectedUsers.forEach((user) => {
       showToastSuccess(`Assigned ${user.firstName} ${user.lastName} successfully!`);
     });

     ticket.assigned_employees.push(...selectedUsers);
     onStatusUpdate("pending");
     setIsModalOpen(false);

     setAvailableUsers(prevUsers => 
       prevUsers.filter(user => !selectedUsers.some(selected => selected.individualId === user.individualId))
     );
   } catch (error) {
     showToastError("There was an error while assigning the user(s).");
     console.error(error);
   }
 };

 const assignYourself = () => {
   try {
     if (!currentUser) {
       showToastError("Unable to assign yourself. User data is unavailable.");
       return;
     }

     const currentUserAsIndividual: Individual = {
       individualId: parseInt(currentUser.userId, 10),
       firstName: currentUser.firstName,
       lastName: currentUser.lastName,
       role: currentUser.role,
     };

     ticket.assigned_employees.push(currentUserAsIndividual);

     setAvailableUsers((prevAvailableUsers) =>
       prevAvailableUsers.filter(
         (user) => user.individualId !== currentUserAsIndividual.individualId
       )
     );

     onStatusUpdate("pending");
     showToastSuccess("Assigned yourself successfully!");
   } catch (error) {
     showToastError("There was an error assigning yourself to this ticket.");
     console.error(error);
   }
 };

 const handleUnassignUser = (userId: number) => {
   try {
     const updatedAssignedUsers = assignedUsers.filter(
       (user) => user.individualId !== userId
     );
     ticket.assigned_employees = updatedAssignedUsers;

     const unassignedUser = assignedUsers.find(
       (user) => user.individualId === userId
     );

     if (unassignedUser) {
       setAvailableUsers((prevAvailableUsers) => [
         ...prevAvailableUsers,
         unassignedUser,
       ]);
     }
   } catch (error) {
     showToastError("There was an error unassigning the user.");
     console.error(error);
   }
 };

 return (
   <>
     {ticket.status === "closed" ? (
       <div className="w-full px-2 bg-white rounded-[38px] pb-6">
         {ticket.assigned_employees.length !== 0 ? (
           <>
             <div className="text-[#254752] px-3 text-[20px] font-sequel-sans w-full  flex items-center justify-between">
               Users Previously Assigned To This Ticket
             </div>
             <div className="w-full px-3 mt-6 flex justify-between text-[#266472] text-s font-sequel-sans">
               <div className="flex-1 text-left">ID</div>
               <div className="flex-1 text-left">Name</div>
               <div className="flex-1 text-center"> Contact </div>
               <div className="flex-1 text-right mr-3">Resolved</div>
             </div>

             {ticket.assigned_employees.map((Individual, index) => (
               <AssignedUserClosedTicket key={index} Individual={Individual} />
             ))}
           </>
         ) : (
           <>
             <div className="text-[#266472] px-3 text-[18px font-sequel-sans w-full">
               No Users Were Assigned To This Ticket When Closed
             </div>
           </>
         )}
       </div>
     ) : assignedUsers.length === 0 ? (
       <>
         <div className="w-full px-2.5 bg-white rounded-[38px] pb-6">
           <div className=" px-3 text-[#254752] text-s font-['Sequel Sans'] ">
             There are currently no users assigned to this ticket.{" "}
             <span
               className="text-[#266472] underline hover:text-[#254752] cursor-pointer transition duration-300"
               onClick={assignYourself}
             >
               Assign yourself
             </span>{" "}
             or{" "}
             <span
               className="text-[#266472] underline hover:text-[#254752] cursor-pointer transition duration-300"
               onClick={handleOpenModal}
             >
               assign another user now
             </span>
             .
           </div>
         </div>
       </>
     ) : (
       <>
         <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6 mb-10">
           <div className="text-[#254752] text-[20px] font-sequel-sans w-full px-[13px] pt-6 flex items-center justify-between">
             Users Assigned To This Ticket
           </div>

           <div className="w-full px-3 mt-6 flex justify-between text-[#266472] text-s font-sequel-sans">
             <div className="flex-1 text-left">ID</div>
             <div className="flex-1 text-left">Name</div>
             <div className="flex-1 text-center"> Unassign </div>
             <div className="flex-1 text-center"> Contact </div>
             <div className="flex-1 text-right mr-3">Resolved</div>
           </div>

           {ticket.assigned_employees.map((Individual, index) => (
             <AssignedUser
               key={index}
               Individual={Individual}
               onUnassignClick={handleUnassignUser}
             />
           ))}

           {assignedUsers.length < MAX_USERS && (
             <div className="flex justify-center mt-3">
               <button
                 className=" px-3 py-1 items-center bg-[#266472] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                 onClick={handleOpenModal}
               >
                 Assign User
               </button>
             </div>
           )}
         </div>
       </>
     )}
      {isModalOpen && (
        <AssignUserModalComponent
          onClose={handleCloseModal}
          availableUsers={availableUsers}
          onSave={handleAssignUser}
          remainingSlots={MAX_USERS - assignedUsers.length}
        />
      )}
   </>
 );
}

export default ManageTicketAssignment;