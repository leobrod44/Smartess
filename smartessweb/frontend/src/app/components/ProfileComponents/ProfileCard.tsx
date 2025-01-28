import Image from "next/image";
import Logo from "../../../public/images/building_straight.png";

const ProfileCard = () => {
  return (
    <div className="flex flex-col justify-between sm:w-3/4 h-[680px] gap-2 drop-shadow-2xl ">
      <div className="flex flex-col justify-center items-center bg-[#266472] rounded-t-lg w-full h-[54px]"></div>
      <div className="justify-between w-full h-full rounded ">
        <div className="flex flex-col justify-center items-center w-full h-full rounded">
          <div className="bg-white w-full h-full rounded ">
            <div className="flex justify-center p-8">
              <Image
                src={Logo}
                alt="Smartess Logo"
                width={300}
                height={300}
                className="w-48 h-48 rounded-full"
              />
            </div>
            <div className="flex justify-center pt-2">
              <label className="cursor-pointer bg-[#266472] hover:bg-[#1f505e] w-28 h-8 text-white text-xs text-center hover:bg-[#1f505e] transition duration-300 rounded-md pt-2 pb-6">
                Upload Image
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white rounded-b-lg w-full h-3/5 p-2">
            <div className="font-sequel-sans-black text-[#4B7D8D] border-b w-1/3 text-center text-l p-2">
              <h1>Role</h1>
            </div>
            <div>
              <div className="flex justify-center pt-3">
                <div className="bg-[#CCCCCC] w-28 text-white text-sm rounded-md p-1">
                  <h1 className="text-center">Master</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileCard;
