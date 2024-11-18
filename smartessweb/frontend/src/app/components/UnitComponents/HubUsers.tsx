import { HubUser } from "../../mockData";

interface HubUsersProps {
  hubUsers: HubUser[];
}

const HubUsers = ({ hubUsers }: HubUsersProps) => {
  //only display first 3 users
  const displayedUsers = hubUsers.slice(0, 3);

  // Function to format the names as "M. Johnson"
  const formatUserName = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}. ${
      lastName.charAt(0).toUpperCase() + lastName.slice(1)
    }`;
  };

  return (
    <div className="max-w-xs p-4 flex flex-col items-center gap-2.5">
      <div className="w-full relative pb-2.5">
        <div className="text-center text-[#4b7d8d] text-l font-sequel-sans-black leading-tight tracking-tight">
          Hub users
        </div>
        <div className="w-[75%] h-px absolute bg-[#4b7d8d] left-1/2 transform -translate-x-1/2" />
      </div>
      <div className="flex flex-col w-full gap-1">
        <div className="flex-col justify-center items-center gap-1 inline-flex">
          {displayedUsers.map((hubUsers, index) => (
            <div
              key={index}
              className="text-black text-xs font-['Sequel Sans'] leading-tight tracking-tight text-center pb-1"
            >
              {formatUserName(hubUsers.firstName, hubUsers.lastName)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HubUsers;
