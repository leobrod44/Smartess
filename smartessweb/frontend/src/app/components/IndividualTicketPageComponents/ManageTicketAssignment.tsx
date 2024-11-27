import React, { useState, useEffect } from "react";
import { Individual, Ticket } from "../../mockData";
import AssignedUser from "./AssignedUserComponent";
import AssignUserModalComponent from "./AssignUserModal";
import { mockUsersNotAssignedToTicker } from "../../mockData";
import { showToastError, showToastSuccess } from "../Toast";
interface ManageTicketProps {
  ticket: Ticket;
  onStatusUpdate: (newStatus: "open" | "pending" | "closed") => void;
}

function ManageTicketAssignment({ ticket, onStatusUpdate }: ManageTicketProps) {
  const assignedUsers = ticket.assigned_employees;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MAX_USERS = 3;
  const [availableUsers, setAvailableUsers] = useState<Individual[]>([]);

  //Get a list of the users that are part of the proj that this ticket is in, but not assigned to the ticket. these are considered available users
  //since i cant do that right now, i will hardcode some users that arent assigned
  useEffect(() => {
    const users = mockUsersNotAssignedToTicker(); // Call the function to get mock users
    setAvailableUsers(users);
  }, []);

  useEffect(() => {
    // Check the assigned users array each time the component updates.. if its empty change status to open
    if (assignedUsers.length === 0) {
      onStatusUpdate("open");
    }
  }, [assignedUsers, onStatusUpdate]);

  const handleOpenModal = () => {
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
        showToastSuccess(
          `Assigned ${user.firstName} ${user.lastName} successfully!`
        );
      });

      ticket.assigned_employees.push(...selectedUsers);
      onStatusUpdate("pending");
      setIsModalOpen(false);

      // Refresh available users list by removing the users that were just added to the ticket (mocked)
      setAvailableUsers(
        availableUsers.filter(
          (user) =>
            !selectedUsers.some(
              (selected) => selected.individualId === user.individualId
            )
        )
      );
    } catch (error) {
      showToastError("There was an error while assigning the user(s).");
      console.error(error);
    }
  };

  //assigning the current user to the ticket (mock function for now...)
  const assignYourself = () => {
    try {
      // Simulate assigning yourself as the first user
      const mockCurrentUser: Individual = {
        individualId: 6,
        firstName: "Current",
        lastName: "User",
        role: "admin",
      };

      ticket.assigned_employees.push(mockCurrentUser);

      setAvailableUsers(
        availableUsers.filter(
          (user) => user.individualId !== mockCurrentUser.individualId
        )
      );
      onStatusUpdate("pending");
      showToastSuccess(`Assigned yourself successfully!`);
    } catch (error) {
      showToastError("There was an error assigning yourself to this ticket.");
      console.error(error);
    }
  };

  const handleUnassignUser = (userId: number) => {
    try {
      // Remove the user from assigned_employees
      const updatedAssignedUsers = assignedUsers.filter(
        (user) => user.individualId !== userId
      );
      ticket.assigned_employees = updatedAssignedUsers;

      //add them back to the available employees
      const unassignedUser = assignedUsers.find(
        (user) => user.individualId === userId
      );

      if (unassignedUser) {
        setAvailableUsers((prevAvailableUsers) => [
          ...prevAvailableUsers,
          unassignedUser,
        ]);
      }
      onStatusUpdate("pending");
    } catch (error) {
      showToastError("There was an error unassigning the user.");
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
          <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
            <div className="text-[#254752] text-[20px] font-sequel-sans w-full px-[13px] pt-6 flex items-center justify-between">
              Users Assigned to this ticket
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
