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
    <div className="max-w-xs p-4 flex flex-col items-center gap-2.5 shadow-md">
      <div className="w-full relative pb-2.5">
        <div className="text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
          Hub users
        </div>
        <div className="w-full h-px absolute bg-[#4b7d8d]" />
      </div>
      <div className="flex flex-col w-full gap-1">
        <div className="flex-col justify-center items-center gap-1 inline-flex">
          {displayedUsers.map((user, index) => (
            <div
              key={index}
              className="text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight text-center pb-2"
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
