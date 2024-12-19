import { HubUser } from "../../mockData";
import DeleteIcon from "@mui/icons-material/Delete";

interface HubUsersProps {
  hubUsers: HubUser[];
}

const HubUsers = ({ hubUsers }: HubUsersProps) => {
  return (
    <div className="relative">
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Users
      </div>

      {/* Table Headers */}
      <div className="hidden md:grid md:grid-cols-5 w-full text-center text-[#14323B] font-semibold text-sm mb-2">
        <div>User</div>
        <div>Telephone</div>
        <div>Email</div>
        <div>Contact</div>
        <div>Actions</div>
      </div>
      {/* Separator Line */}
      <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

      <div className="flex flex-col gap-6 overflow-y-auto max-h-[300px] custom-scrollbar scrollbar-thumb-[#4b7d8d] scrollbar-track-gray-200">
        {hubUsers.map((user, index) => (
          <div
            key={index}
            className="md:grid md:grid-cols-5 w-full text-center text-black text-sm gap-2 px-2"
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
              <div className="text-[#14323B] font-semibold">Actions:</div>
              <button className="mt-2">
                <DeleteIcon className="text-[#e63946] hover:text-[#a22233] transition duration-300 cursor-pointer" />
              </button>
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
            <div className="hidden md:flex justify-center">
              <button>
                <DeleteIcon className="text-[#e63946] hover:text-[#a22233] transition duration-300 cursor-pointer" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubUsers;
