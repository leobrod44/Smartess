"use client";
import EditIcon from "@mui/icons-material/Edit";

interface ManageAccountsListProps {
  address: string;
  userName: string;
  permission: "admin" | "basic" | "master";
  currentUserRole: "admin" | "basic" | "master"; // Current user's role
}

const ManageAccountsList: React.FunctionComponent<ManageAccountsListProps> = ({
  address,
  userName,
  permission,
  currentUserRole,
}) => {
  // Determine the background and text color based on the permission type
  const getColorClasses = () => {
    switch (permission) {
      case "basic":
        return "bg-[#A6634F] text-white";
      case "admin":
        return "bg-[#729987] text-white";
      case "master":
        return "bg-[#CCCCCC] text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="account-card border p-4 rounded shadow-sm flex items-center justify-between">
      <div className="flex-1">
        <p>{address}</p>
      </div>
      <div className="flex-1">
        <p>{userName}</p>
      </div>
      <div className="flex-1">
        <div
          className={`w-[78px] h-8 px-5 rounded-[20px] flex items-center justify-center ${getColorClasses()}`}
        >
          <p className="text-sm font-medium">{permission}</p>
        </div>
      </div>
      {/* Render the edit icon only if the current user has the "master" role */}
      {currentUserRole === "master" && (
        <div className="ml-4">
          <EditIcon className="text-[#30525E] cursor-pointer" />
        </div>
      )}
    </div>
  );
};

export default ManageAccountsList;
