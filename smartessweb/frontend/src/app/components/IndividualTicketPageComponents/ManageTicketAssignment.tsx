import React, { useState, useEffect } from "react";
import { Individual, Ticket, CurrentUser } from "../../mockData";
import AssignedUser from "./UserComponents/AssignedUserComponent";
import AssignUserModalComponent from "./AssignUserModal";
import { mockUsersNotAssignedToTicker } from "../../mockData";
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

  //get current logged in users role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const responseCurrentUser = await manageAccountsApi.getCurrentUserApi(
          token
        );
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
      } finally {
        //setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  //Get a list of the users that are part of the proj that this ticket is in, but not assigned to the ticket. these are considered available users
  //since i cant do that right now, i will hardcode some users that arent assigned
  useEffect(() => {
    const users = mockUsersNotAssignedToTicker(); // Call the function to get mock users
    setAvailableUsers(users);
  }, []);

  useEffect(() => {
    // Check if there are no assigned users, and if the status isnt open. if so, change it to open
    if (assignedUsers.length === 0 && ticket.status !== "open") {
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

  //assigning the current user to the ticket 
  const assignYourself = () => {
    try {
      //convert crrentUser to an individual..... have to do thisbecause current user
      //and individual are different types..so i cant add the current user to the list of assigned employees
      //since assigned employees are of  individual type...
      //CURRENTLY FIRST AND LAST NAME ARE UNDEFINED

      if (!currentUser) {
        showToastError("Unable to assign yourself. User data is unavailable.");
        return;
      }

      // Convert currentUser to Individual type
      const currentUserAsIndividual: Individual = {
        individualId: parseInt(currentUser.userId, 10), 
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role,
      };

      // Assign the current user
      ticket.assigned_employees.push(currentUserAsIndividual);

      // Update available users by filtering out the current user
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
    } catch (error) {
      showToastError("There was an error unassigning the user.");
      console.error(error);
    }
  };

  return (
    <>
      {ticket.status === "closed" ? ( //if ticket is closed, display this section with the previously assigned users
        <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
          <div className="text-[#254752] text-[20px] font-sequel-sans w-full  pt-6 flex items-center justify-between">
            Users Previously Assigned to this ticket
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
        </div>
      ) : assignedUsers.length === 0 ? ( //if ticket has no users assigned, display section to assign users
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
        //if ticket has some users assigned, display them
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
