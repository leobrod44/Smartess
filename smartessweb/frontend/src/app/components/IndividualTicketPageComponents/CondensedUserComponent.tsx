import React, { useState } from "react";

interface CondensedUserProps {
  userId: string;
  firstName: string;
  lastName: string;
  isAssigned: boolean;
  onToggle: (newState: boolean) => void;
}

const CondensedUserComponent = ({
  userId,
  firstName,
  lastName,
  isAssigned,
  onToggle,
}: CondensedUserProps) => {
  const [assigned, setAssigned] = useState(isAssigned);

  const handleToggle = () => {
    const newState = !assigned;
    setAssigned(newState);
    onToggle(newState);
  };

  return (
    <div className="w-full flex items-center border border-[#266472]/40 rounded-md py-3 px-4">
      <div className="w-1/4 text-[#266472] text-s font-['Sequel Sans'] leading-tight tracking-tight">
        {userId}
      </div>
      <div className="w-1/2 text-[#266472] text-s font-['Sequel Sans'] leading-tight tracking-tight truncate">
        {firstName} {lastName}
      </div>
      <div className="w-1/4 flex justify-center items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={assigned}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-[#266472] transition duration-300"></div>
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5 absolute top-0.5 left-0.5`}
          ></div>
        </label>
      </div>
    </div>
  );
};

export default CondensedUserComponent;
