const HubOwner = ({
  owner,
}: {
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
  } | null;
}) => {
  // Formatting method to ensure the names have first letter capitalization only
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Check if the owner exists and has valid properties
  const hasOwner =
    owner &&
    owner.firstName &&
    owner.lastName &&
    owner.telephone &&
    owner.email;

  return (
    <div>
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Owner
      </div>

      {hasOwner ? (
        <div className="flex flex-col ">
          {/* Table Headers for Large Screens */}
          <div className="hidden md:grid grid-cols-4 w-full text-center text-[#14323b] font-semibold text-sm  mb-2 mt-4">
            <div className="pr-8">User</div>
            <div className="pr-12">Telephone</div>
            <div className="pr-8">Email</div>
            <div className="pr-6">Contact</div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

          {/* Data Row */}
          <div className="flex flex-col md:grid grid-cols-4 pl-4 w-full text-black text-sm mb-4 gap-2 md:gap-0">
            {/* Stacked View for Small Screens */}
            <div className="md:hidden text-center">
              <div className=" text-[#14323B] font-semibold">User:</div>{" "}
              {formatName(owner.firstName)} {formatName(owner.lastName)}
              <div className="text-[#14323B] font-semibold pr-2">
                Telephone:
              </div>{" "}
              {owner.telephone}
              <div className="text-[#14323B] font-semibold">Email:</div>
              {owner.email}
              <div className="flex justify-center">
                <button className="ml-2 mt-2 w-[80px] h-[22px] bg-[#a6634f] rounded-md hover:bg-[#bc7862] transition duration-300 text-white text-xs font-medium">
                  Contact
                </button>
              </div>
            </div>

            {/* Table View for Larger Screens */}
            <div className="hidden md:block pl-2">
              {formatName(owner.firstName)} {formatName(owner.lastName)}
            </div>
            <div className="hidden md:block pl-4">{owner.telephone}</div>
            <div className="hidden md:block">{owner.email}</div>
            <div className="hidden md:flex justify-center">
              <button className="w-[80px] h-[22px] bg-[#a6634f] rounded-md hover:bg-[#bc7862] transition duration-300 text-white text-xs font-medium">
                Contact
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-black text-sm">No hub owner found</div>
      )}
    </div>
  );
};

export default HubOwner;
