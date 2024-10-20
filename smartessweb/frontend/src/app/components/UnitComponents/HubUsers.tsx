import React, { useState } from "react";

// Define the interface for user data
interface User {
  firstName: string;
  lastName: string;
}

interface HubUsersProps {
  users: User[];
}

const HubUsers = ({ users }: HubUsersProps) => {
  //only display first 3 users
  const displayedUsers = users.slice(0, 3);

  // Function to format the names as "M. Johnson"
  const formatUserName = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}. ${
      lastName.charAt(0).toUpperCase() + lastName.slice(1)
    }`;
  };

  return (
    <div className="w-[229px] h-[173px] relative bg-white">
      <div className="h-[47px] px-[9px] pb-3.5 left-[42px] top-[6px] absolute bg-white/0 flex-col justify-start items-start inline-flex">
        <div className="w-[132px] h-[33px] text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
          Hub users
        </div>
        <div className="w-36 h-px bg-[#4b7d8d]" />
      </div>
      <div className="w-[213px] px-[3px] left-[16px] top-[45px] absolute bg-white/0 justify-center items-center gap-[5px] inline-flex">
        <div className="w-[120px] h-[122px] px-[5px] py-[7px] bg-[#bbbbbb]/0 flex-col justify-center items-center gap-1 inline-flex">
          {displayedUsers.map((user, index) => (
            <div
              key={index}
              className="self-stretch h-7 text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight"
            >
              {formatUserName(user.firstName, user.lastName)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HubUsers;
