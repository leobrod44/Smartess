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
      <div className="hidden md:grid md:grid-cols-4 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
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
            className="md:grid md:grid-cols-4 w-full text-center text-black text-sm gap-2"
          >
            {/* Stacked view for small screens */}
            <div className="md:hidden text-center">
              <div className="text-[#14323B] font-semibold">User:</div>{" "}
              {user.firstName} {user.lastName}
              <div className="text-[#14323B] font-semibold">
                Telephone:
              </div>{" "}
              {user.telephone || "Not Provided"}
              <div className="text-[#14323B] font-semibold">Email:</div>{" "}
              {user.email}
              <p>
                <button className="ml-2 mt-2 w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
                  Contact
                </button>
              </p>
            </div>

            {/* Table view for medium and larger screens */}
            <div className="hidden md:block">
              {user.firstName} {user.lastName}
            </div>
            <div className="hidden md:block">
              {user.telephone || "Not Provided"}
            </div>
            <div className="hidden md:block">{user.email}</div>
            <div className="hidden md:flex justify-center">
              <button className="w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className=" flex justify-center md:flex justify-center">
        <button className="w-[150px] h-[30px] mt-6 bg-[#266472] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-medium">
          Manage All Users
        </button>
      </div>
    </div>
  );
};

export default HubUsers;
