const HubOwner = ({ owner }: { owner: { firstName: string; lastName: string; email: string } }) => {
    
    //Formatting method to ensure the names have first letter capitalization only
    const formatName = (name: string) => {
        return name
          .toLowerCase() 
          .split(' ') 
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
          .join(' '); 
      };
      return(
    <div className="w-[246px] h-[173px] px-[15px] py-2.5 bg-white flex-col justify-start items-center gap-2.5 inline-flex">
      <div className="w-[162px] h-[47px] relative bg-transparent">
        <div className="w-[132px] h-[33px] left-[9px] top-0 absolute text-center text-[#4b7d8d] text-xl font-['Sequel Sans'] leading-tight tracking-tight">
          Hub owner
        </div>
        <div className="w-36 h-px left-[9px] top-[33px] absolute bg-[#4b7d8d]"></div>
      </div>
      <div className="w-[244px] h-[17px] text-center text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight">
        {formatName(owner.firstName)} {formatName(owner.lastName)}
      </div>
      <div className="w-[245px] text-center text-black text-sm font-['Sequel Sans'] leading-tight tracking-tight">
        {owner.email}
      </div>
      <button className="w-[78px] h-[23px] px-0.5 bg-[#4b7d8d] rounded-[10px] justify-center items-center gap-5 inline-flex hover:bg-[#1f505e] transition duration-300 text-center text-white text-xs font-['Sequel Sans'] leading-tight tracking-tight">
        Contact
      </button>
    </div>
  );
}
  export default HubOwner;
  