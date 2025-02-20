const ProfileInfo = ({
  currentUser,
  onOpenPassword,
  onOpenPhoneNumber,
}: {
  currentUser: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  onOpenPassword: () => void;
  onOpenPhoneNumber: () => void;
}) => {
  return (
    <div className="flex flex-col  w-full h-[680px] gap-2 drop-shadow-2xl">
      <div className="flex flex-col justify-center items-center bg-[#266472] rounded-t-lg w-full  h-[60px]"></div>
      <div className="flex flex-row justify-center items-left bg-white rounded w-full h-full">
        {/* Outter card */}
        <div className="flex flex-col justify-center w-5/6 h-3/5">
          {/* Inner row */}
          <div className="p-2 border-b">
            <div className="flex flex-row justify-between">
              <div className="flex justify-start gap-3">
                <div>
                  <h1 className="font-sequel-sans-black text-[#4B7D8D] text-l pt-8 ">
                    First name:
                  </h1>
                </div>
                <div>
                  <h1 className="font-sequel-sans text-[#000] text-l pt-8">
                    {currentUser.firstName}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="flex flex-row justify-between">
              <div className="flex justify-start gap-3">
                <div>
                  <h1 className="font-sequel-sans-black text-[#4B7D8D] text-l pt-8">
                    Last name:
                  </h1>
                </div>
                <div>
                  <h1 className="font-sequel-sans text-[#000] text-l pt-8">
                    {currentUser.lastName}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="flex flex-row justify-between">
              <div className="flex justify-start gap-3">
                <div>
                  <h1 className="font-sequel-sans-black text-[#4B7D8D] text-l pt-8">
                    Email Address:
                  </h1>
                </div>
                <div>
                  <h1 className="font-sequel-sans text-[#000] text-l pt-8">
                    {currentUser.email}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="flex flex-row justify-between">
              <div className="flex justify-start gap-3">
                <div>
                  <h1 className="font-sequel-sans-black text-[#4B7D8D] text-l pt-8">
                    Phone number:
                  </h1>
                </div>
                <div>
                  <h1 className="font-sequel-sans text-[#000] text-l pt-8">
                    {currentUser.phoneNumber}
                  </h1>
                </div>
              </div>

              <div className="flex flex-row justify-end items-center pt-5">
                <button
                  className="bg-[#266472] hover:bg-[#1f505e] w-20 h-6 text-white text-xs hover:bg-[#1f505e] transition duration-300 rounded-md"
                  onClick={onOpenPhoneNumber}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="flex flex-row justify-between">
              <div className="flex justify-start gap-3">
                <div>
                  <h1 className="font-sequel-sans-black text-[#4B7D8D] text-l pt-8">
                    Password
                  </h1>
                </div>
                <div>
                  <h1 className="font-sequel-sans text-[#000] text-l pt-8">
                    ********
                  </h1>
                </div>
              </div>

              <div className="flex flex-row justify-end items-center pt-5">
                <button
                  className="bg-[#266472] hover:bg-[#1f505e] w-20 h-6 text-white text-xs hover:bg-[#1f505e] transition duration-300 rounded-md"
                  onClick={onOpenPassword}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-[#266472] rounded-b-lg w-full h-[60px] "></div>
    </div>
  );
};
export default ProfileInfo;
