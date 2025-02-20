import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

const HubOwner = ({
  owner,
}: {
  owner: { firstName: string; lastName: string; email: string } | null;
}) => {
  //Formatting method to ensure the names have first letter capitalization only
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Check if the owner exists and has valid properties
  const hasOwner = owner && owner.firstName && owner.lastName && owner.email;

  return (
    <div className="max-w-xs p-4 flex flex-col items-center gap-2.5 pr-1">
      <div className="w-full relative pb-2.5">
        <div className="text-center text-[#4b7d8d] text-l font-medium leading-tight tracking-tight">
          Hub Owner
        </div>
        <div className="w-[75%] h-px absolute bg-[#4b7d8d] left-1/2 transform -translate-x-1/2 "></div>
      </div>

      {hasOwner ? (
        <>
          <div className="text-center text-black text-xs font-['Sequel Sans'] leading-tight tracking-tight">
            {formatName(owner.firstName)} {formatName(owner.lastName)}
          </div>
          <div className="text-center text-black text-xs font-['Sequel Sans'] leading-tight tracking-tight">
            {owner.email}
          </div>
          <button className="w-[80px] h-[22px]  flex items-center justify-center gap-2 bg-[#4b7d8d] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
            Contact
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="text-center text-black text-xs font-['Sequel Sans'] leading-tight tracking-tight">
          No hub owner found
        </div>
      )}
    </div>
  );
};

export default HubOwner;
