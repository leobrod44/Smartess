"use client";

interface ManageAccountsListProps {
  address: string;
  userName: string;
  permission: "admin" | "basic" | "master";
}

const ManageAccountsList: React.FC<ManageAccountsListProps> = ({
  address,
  userName,
  permission,
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
        return "bg-gray-300 text-black"; // Default styling
    }
  };

  return (
    <div className="account-card border p-4 rounded shadow-sm flex space-x-8">
      <p className="flex-1">{address}</p>
      <p className="flex-1">{userName}</p>
      <div className="flex-1">
        <div
          className={`w-[78px] h-8 px-5 rounded-[20px] flex items-center justify-center ${getColorClasses()}`}
        >
          <p className="text-sm font-medium">{permission}</p>
        </div>
      </div>
    </div>
  );
};
export default ManageAccountsList;
