const HubOwner = ({
  owner,
}: {
  owner: { firstName: string; lastName: string; email: string };
}) => {
  //Formatting method to ensure the names have first letter capitalization only
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="max-w-xs p-4 flex flex-col items-center gap-2.5 shadow-md">
      <div className="w-full relative pb-2.5">
        <div className="text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
          Hub owner
        </div>
        <div className="w-full h-px absolute bg-[#4b7d8d]"></div>
      </div>
      <div className="text-center text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight">
        {formatName(owner.firstName)} {formatName(owner.lastName)}
      </div>
      <div className="text-center text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight">
        {owner.email}
      </div>
      <button className="mt-3 w-[80px] h-[22px] bg-[#4b7d8d] rounded-md hover:bg-[#1f505e] transition duration-300 text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
        Contact
      </button>
    </div>
  );
};
export default HubOwner;
