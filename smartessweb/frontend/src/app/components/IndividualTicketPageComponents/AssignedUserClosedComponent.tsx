import { Individual } from "@/app/mockData";
import React, { useState } from "react";
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
        <button className="py-1 bg-[#729987] rounded-[20px] justify-center items-center hover:bg-[#5C7A6B] transition duration-300 px-3  text-center text-white text-xs font-['Sequel Sans']">
          Contact
        </button>
      </div>

      <div className=" flex-1 text-[#a6634f] text-xs font-sequel-sans-black text-right mr-3">
        UNRESOLVED
      </div>
    </div>
  );
}

export default AssignedUserClosedTicket;
