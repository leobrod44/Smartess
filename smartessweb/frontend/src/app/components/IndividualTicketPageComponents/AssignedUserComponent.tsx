import { Individual } from "@/app/mockData";
import React from "react";

interface AssignedUserProps {
  Individual: Individual;
}

function AssignedUser({ Individual }: AssignedUserProps) {
  return (
    <div className="w-full px-3 py-3 my-5 rounded-[5px] border border-[#266472]/40 items-center inline-flex justify-between ">
      <div className=" text-[#266472] text-s font-['Sequel Sans'] ">
        {Individual.individualId}
      </div>

      <div className=" text-[#266472] text-s font-['Sequel Sans'] ">
        {Individual.firstName} {" "}
        {Individual.lastName}
      </div>

      <button className="px-4 py-1 items-center bg-[#266472] rounded-md hover:bg-[#254752] transition duration-300 text-center text-white text-xs font-['Sequel Sans']">
        Unassign
      </button>

      <button className="py-1 bg-[#729987] rounded-[20px] justify-center items-center hover:bg-[#5C7A6B] transition duration-300 px-3  text-center text-white text-xs font-['Sequel Sans']">
        Contact
      </button>

      <div className=" text-[#a6634f] text-xs font-sequel-sans-black ">
        UNRESOLVED
      </div>
    </div>
  );
}

export default AssignedUser;
