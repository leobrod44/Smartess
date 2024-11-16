const HubOwner = ({
  owner,
}: {
  owner: { firstName: string; lastName: string; email: string } | null;
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
        <div className="flex flex-col items-center">
          {/* Table Headers */}
          <div className="grid grid-cols-4 w-full text-center text-[#14323b] font-semibold text-sm mb-2 mt-4">
            <div>User</div>
            <div>Telephone</div>
            <div>Email</div>
            <div>Contact</div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-px bg-[#4b7d8d] mb-4"></div>

          {/* Data Row */}
          <div className="grid grid-cols-4 w-full text-center text-black text-sm mb-4">
            <div>
              {formatName(owner.firstName)} {formatName(owner.lastName)}
            </div>
            <div>{owner.telephone}</div>
            <div>{owner.email}</div>
            <div>
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
