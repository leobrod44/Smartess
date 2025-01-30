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
  return (
    <div>
      {/* Title */}
      <div className="h-5 mb-6 text-center text-[#4b7d8d] text-[25px] font-bold leading-tight tracking-tight">
        Hub Owner
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

      {owner ? (
        <div className="md:grid md:grid-cols-4 w-full text-center text-black text-sm gap-2 px-2">
          {/* Stacked View for Small Screens */}
          <div className="md:hidden text-center">
            <div className="text-[#14323B] font-semibold">User:</div>{" "}
            {owner.firstName} {owner.lastName}
            <div className="text-[#14323B] font-semibold">Telephone:</div>{" "}
            {owner.telephone
              ? `${owner.telephone.slice(0, 3)}-${owner.telephone.slice(
                  3,
                  6
                )}-${owner.telephone.slice(6)}`
              : "Not Provided"}
            <div className="text-[#14323B] font-semibold">Email:</div>{" "}
            {owner.email}
            <p>
              <button className="ml-2 mt-2 w-[80px] h-[22px] bg-[#a6634f] rounded-md hover:bg-[#bc7862] transition duration-300 text-white text-xs font-medium">
                Contact
              </button>
            </p>
          </div>

          {/* Table View for Medium and Larger Screens */}
          <div className="hidden md:block">
            {owner.firstName} {owner.lastName}
          </div>
          <div className="hidden md:block">
            {owner.telephone
              ? `${owner.telephone.slice(0, 3)}-${owner.telephone.slice(
                  3,
                  6
                )}-${owner.telephone.slice(6)}`
              : "Not Provided"}
          </div>
          <div className="hidden md:block">{owner.email}</div>
          <div className="hidden md:flex justify-center">
            <button className="w-[80px] h-[22px] bg-[#729987] rounded-md hover:bg-[#bc7862] transition duration-300 text-white text-xs font-medium">
              Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-black text-sm">No hub owner found</div>
      )}
    </div>
  );
};

export default HubOwner;
