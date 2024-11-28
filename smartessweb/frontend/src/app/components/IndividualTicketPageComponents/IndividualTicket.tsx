import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Ticket } from "../../mockData";

interface IndividualTicketProps {
  ticket: Ticket;
}

function IndividualTicket({ ticket }: IndividualTicketProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [isTextShort, setIsTextShort] = useState(false);
  const formattedDate = ticket.created_at.toLocaleDateString();

  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTextHeight = () => {
      if (textRef.current) {
        const isShort =
          textRef.current.scrollHeight <= textRef.current.clientHeight;
        setIsTextShort(isShort);
      }
    };
    checkTextHeight();
    window.addEventListener("resize", checkTextHeight);

    return () => {
      window.removeEventListener("resize", checkTextHeight);
    };
  }, [ticket.description]);

  const handleToggle = () => { setShowFullText((prev) => !prev);  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "closed":
        return "#cccccc";
      case "pending":
        return "#a6634f";
      case "open":
      default:
        return "#729987";
    }
  };

  return (
    <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl pb-6">
      <div className="w-full px-[13px] pt-6 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div className="text-[#254752] text-[30px] font-sequel-sans-black">
            Unit {ticket.unit_number}
          </div>
          <div className="text-[#254752] text-[20px] font-sequel-sans ">
            {ticket.project_address}
          </div>
        </div>

        <div
          className=" px-5 rounded-[20px] flex justify-center items-center text-center text-white text-s font-sequel-sans"
          style={{ backgroundColor: getStatusColor(ticket.status) }}
        >
          {ticket.status}
        </div>
      </div>

      <div className="w-full pt-6 px-4 flex flex-col items-start">
        <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
          Ticket ID: {ticket.ticket_id}
        </div>
        <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
          Ticket Type: {ticket.type}
        </div>
        <div className="flex justify-start items-start gap-8">
          <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
            Submitted by: {ticket.submitted_by_firstName}{" "}
            {ticket.submitted_by_lastName}
          </div>
          <button className="px-[17px] py-2 bg-[#729987] rounded-[20px] flex justify-center items-center hover:bg-[#5C7A6B] transition duration-300">
            <div className="text-center text-white text-m font-sequel-sans leading-3">
              Contact
            </div>
          </button>
        </div>
      </div>

      <div className="w-[full] h-[3px] my-7 bg-[#a0bfca] rounded-[5px]"></div>

      <div className="w-full px-4 flex flex-col items-start gap-[7px]">
        <div className="w-full flex justify-between items-end">
          <div className="text-[#14323b] text-2xl font-sequel-sans">
            {ticket.title}
          </div>
          <div className="text-black text-l font-normal font-['Sequel Sans']">
            {formattedDate}
          </div>
        </div>

        <div
          ref={textRef}
          className={`text-black text-s font-normal font-sequel-sans leading-[30px]  ${
            showFullText ? "block" : "text-truncate"
          }`}
        >
          {ticket.description}
        </div>

        {!isTextShort && (
          <div className="flex justify-end w-full py-2">
            <button
              className="bg-[#4b7d8d] pl-2 text-white h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300"
              onClick={handleToggle}
            >
              {showFullText ? "See Less" : "See More"}
              {showFullText ? (
                <ChevronUpIcon className="w-5 h-5 ml-2" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 ml-2" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualTicket;
