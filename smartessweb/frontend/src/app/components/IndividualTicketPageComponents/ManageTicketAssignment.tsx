import React, { useState, useEffect } from "react";
import { Individual, Ticket } from "../../mockData";
import AssignedUser from "./AssignedUserComponent";
import AssignUserModalComponent from "./AssignUserModal";
import { mockUsersNotAssignedToTicker } from "../../mockData";
import { showToastError, showToastSuccess } from "../Toast";
interface ManageTicketProps {
  ticket: Ticket;
}

function ManageTicketAssignment({ ticket }: ManageTicketProps) {
  const assignedUsers = ticket.assigned_employees;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MAX_USERS = 3;

  // get a list of users that are part of the proj that this ticket is in, but not assigned to the ticket. these are available users
  //since i cant do that right now, i will hardcode some users that arent assigned
  const [availableUsers, setAvailableUsers] = useState<Individual[]>([]);

  useEffect(() => {
    const users = mockUsersNotAssignedToTicker(); // Call the function to get mock users
    setAvailableUsers(users);
  }, []);

  const handleAssignUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

const handleAssignUser = (selectedUsers: Individual[]) => {
    try {
      if (assignedUsers.length + selectedUsers.length > MAX_USERS) {
        showToastError(
          `Cannot assign more than ${MAX_USERS} users to this ticket.`
        );
        return;
      }

      // Simulate assigning users
      selectedUsers.forEach((user) => {
        showToastSuccess(`Assigned ${user.firstName} ${user.lastName} successfully!`);
      });

      // Logic to update the ticket with newly assigned users
      ticket.assigned_employees.push(...selectedUsers);
      setIsModalOpen(false);

      // Refresh available users (mocked here)
      setAvailableUsers(
        availableUsers.filter(
          (user) => !selectedUsers.some((selected) => selected.individualId === user.individualId)
        )
      );
    } catch (error) {
      showToastError("There was an error while assigning the user(s).");
      console.error(error);
    }
  };
  return (
    <>
      {ticket.status === "closed" ? (
        <div className="px-1 text-[#254752] text-[16px] font-sequel-sans">
          This ticket is closed and cannot have assigned users.
        </div>
      ) : assignedUsers.length === 0 ? (
        <>
          <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
            <div className="w-full px-[13px] pt-6 flex items-center justify-between">
              <div className="text-[#254752] text-[20px] font-sequel-sans">
                Users Assigned to this ticket
              </div>
            </div>
            <div className=" px-[13px] text-[#254752] text-s font-['Sequel Sans'] mt-6">
              There are currently no users assigned to this ticket.{" "}
              <span
                className="text-[#266472] underline hover:text-[#254752] cursor-pointer transition duration-300"
                onClick={() => console.log("Assign yourself clicked")}
              >
                Assign yourself
              </span>{" "}
              or{" "}
              <span
                className="text-[#266472] underline hover:text-[#254752] cursor-pointer transition duration-300"
                onClick={handleAssignUserClick}
              >
                assign another user now
              </span>
              .
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
            <div className="w-full px-[13px] pt-6 flex items-center justify-between">
              <div className="text-[#254752] text-[20px] font-sequel-sans">
                Users Assigned to this ticket
              </div>
            </div>

            <div className="w-full px-3 mt-6 inline-flex justify-between text-[#266472] text-s font-sequel-sans">
              <div>ID</div>
              <div>Name</div>
              <div> Unassign </div>
              <div> Contact </div>
              <div>Resolved</div>
            </div>

            {ticket.assigned_employees.map((Individual, index) => (
              <AssignedUser key={index} Individual={Individual} />
            ))}

            {assignedUsers.length <  MAX_USERS &&  (
              <div className="flex justify-center mt-3">
                <button
                  className=" px-3 py-1 items-center bg-[#266472] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                  onClick={handleAssignUserClick}
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
        />
      )}
    </>
  );
}

export default ManageTicketAssignment;
