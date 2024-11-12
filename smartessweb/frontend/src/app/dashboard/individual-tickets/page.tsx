"use client";

import { useEffect, useState } from "react";
import IndividualTicket from "@/app/components/IndividualTicket";
import { generateMockProjects, Ticket } from "../../mockData";

const IndividualTicketPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Example to set the ticket (for demonstration, fetching from mock data)
    const projects = generateMockProjects();
    const specificTicket = projects[0]?.units[0]?.ticket[0];
    if (specificTicket) {
      setSelectedTicket(specificTicket);
    }
  }, []);

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
        <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-4">
          Ticket Information
        </div>
        {selectedTicket && <IndividualTicket ticket={selectedTicket} />}
      </div>
    </div>
  );
};

export default IndividualTicketPage;
