import { HubUser } from "../../mockData";

interface HubUsersProps {
  hubUsers: HubUser[];
}

const HubUsers = ({ hubUsers }: HubUsersProps) => {
  return (
    <div>
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Users
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-4 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>User</div>
        <div>Telephone</div>
        <div>Email</div>
        <div>Contact</div>
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>
      {/* Table Rows */}
      <div className="flex flex-col gap-6">
        {hubUsers.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-4 w-full text-center text-black text-sm"
          >
            <div>
              {user.firstName} {user.lastName}
            </div>
            <div>{user.telephone || "Not Provided"}</div>
            <div>{user.email}</div>
            <div>
              <button className="w-[80px] h-[22px] ml-4 bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubUsers;
