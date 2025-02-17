import { Individual } from "@/app/mockData";
import React from "react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
interface AssignedUserProps {
  Individual: Individual;
}

function AssignedUserClosedTicket({ Individual }: AssignedUserProps) {
  return (
    <div className="w-full px-3 py-3 my-5 rounded-[5px] border border-[#266472]/40 items-center inline-flex justify-between">
      <div className="flex-1 text-[#266472] text-xs font-['Sequel Sans'] ">
        {Individual.individualId}
      </div>

      <div className="flex-1 text-[#266472] text-xs font-['Sequel Sans'] w-max-[163px] truncate ">
        {Individual.firstName} {Individual.lastName}
      </div>

      <div className="flex-1 flex justify-center">
        <button className="w-[80px] h-[22px] flex items-center justify-center gap-2 bg-[#4b7d8d] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          Contact
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
        </button>
      </div>

      <div className=" flex-1 text-[#a6634f] text-xs font-sequel-sans-black text-right mr-3">
        UNRESOLVED
      </div>
    </div>
  );
}

export default AssignedUserClosedTicket;
