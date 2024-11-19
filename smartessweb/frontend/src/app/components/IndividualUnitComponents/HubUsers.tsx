import { HubUser } from "../../mockData";

interface HubUsersProps {
  hubUsers: HubUser[];
}

const HubUsers = ({ hubUsers }: HubUsersProps) => {
  return (
    <div>
      {/* Title */}
      <div className="text-center text-[#4b7d8d] text-lg font-bold mb-4">
        Hub Users
      </div>

      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      {/* Table Headers */}
      <div className="grid grid-cols-4 w-full text-center text-[#325a67] font-semibold text-sm mb-2">
        <div>User</div>
        <div>Telephone</div>
        <div>Email</div>
        <div>Contact</div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col gap-2">
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
              <button className="w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
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
