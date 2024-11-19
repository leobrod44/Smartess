import React, { useState } from "react";
import { Ticket } from "../../mockData";
import AssignedUser from "./AssignedUserComponent";
import AssignUserModalComponent from "./AssignUserModal";
interface ManageTicketProps {
  ticket: Ticket;
}

function ManageTicketAssignment({ ticket }: ManageTicketProps) {
  const assignedUsers = ticket.assigned_employees;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssignUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
      <div className="w-full px-[13px] pt-6 flex items-center justify-between">
        <div className="text-[#254752] text-[20px] font-sequel-sans ">
          Users Assigned to this ticket
        </div>
      </div>

      {assignedUsers.length === 0 ? (
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
      ) : (
        <>
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

          {assignedUsers.length < 3 && (
            <div className="flex justify-center mt-3">
              <button
                className=" px-3 py-1 items-center bg-[#266472] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']"
                onClick={handleAssignUserClick}
              >
                Assign User
              </button>
            </div>
          )}
        </>
      )}
      {isModalOpen && <AssignUserModalComponent onClose={handleCloseModal} />}
    </div>
  );
}

export default ManageTicketAssignment;
