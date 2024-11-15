"use client";

import { useEffect, useState } from "react";
import IndividualTicket from "@/app/components/IndividualTicketPageComponents/IndividualTicket";
import { generateMockProjects, Ticket } from "../../mockData";
import BackArrowButton from "@/app/components/BackArrowBtn";
import ManageTicketAssignment from "@/app/components/IndividualTicketPageComponents/ManageTicketAssignment";

const IndividualTicketPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Example to set the ticket (for demonstration, fetching from mock data)-- will be changed once backend is connected
    const projects = generateMockProjects();
    const specificTicket = projects[0]?.units[0]?.ticket[0];
    if (specificTicket) {
      setSelectedTicket(specificTicket);
    }
  }, []);

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
        <div className="flex items-center justify-between pb-4">
          <div className="text-[#325a67] text-[30px] leading-10 tracking-tight">
            Ticket Information
          </div>
          <BackArrowButton />
        </div>
        {selectedTicket && <IndividualTicket ticket={selectedTicket} />}
        <div className="text-[#325a67] text-[30px] leading-10 tracking-tight pt-10 pb-5">
          Manage Ticket Assignment
        </div>
        {selectedTicket && <ManageTicketAssignment ticket={selectedTicket} />}

        <div className="flex justify-center gap-10 mt-8">
          <button className=" px-3 py-1 items-center bg-[#4b7d8d] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-s font-['Sequel Sans']">
            Close Ticket
          </button>

          <button className=" px-3 py-1 items-center bg-[#ff5449] rounded-md hover:bg-[#9b211b] transition duration-300 text-center text-white text-s font-['Sequel Sans']">
            Delete Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndividualTicketPage;
