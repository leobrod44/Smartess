"use client";

import Image from "next/image";
import Logo from "../../../public/images/building_straight.png";
import { manageAccountsApi } from "@/api/page";
import { showToastError, showToastSuccess } from "../Toast";
import { useUserContext } from "@/context/UserProvider";

interface CurrentUserProps {
  role: string;
  profilePicture?: string;
}

const ProfileCard = ({ currentUser }: { currentUser: CurrentUserProps }) => {
  const { setUserProfilePicture } = useUserContext();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in local storage");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const { profilePictureUrl } =
          await manageAccountsApi.storeProfilePictureApi(token, formData);
        showToastSuccess("Profile picture uploaded successfully.");
        setUserProfilePicture(profilePictureUrl);
      } catch (error) {
        console.log(error);
        showToastError("Error uploading profile picture:");
      }
    }
  };

  return (
    <div className="flex flex-col justify-between sm:w-3/4 h-[680px] gap-2 drop-shadow-2xl ">
      <div className="flex flex-col justify-center items-center bg-[#1f505e] rounded-t-lg w-full h-[54.5px]"></div>
      <div className="justify-between w-full h-full rounded ">
        <div className="flex flex-col justify-center items-center w-full h-full rounded">
          <div className="bg-white w-full h-full rounded ">
            <div className="flex flex-col justify-center items-center w-full h-full">
              <Image
                src={currentUser.profilePicture || Logo}
                alt="Profile Picture"
                width={300}
                height={600}
                className="w-64 h-64 rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col items-center bg-white rounded-b-lg w-full h-4/5 p-2">
            <div className="flex justify-center pb-10">
              <label className="cursor-pointer bg-[#266472] hover:bg-[#1f505e] w-28 h-8 text-white text-xs text-center transition duration-300 rounded-md pt-2 pb-6">
                Change Avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="font-sequel-sans-black text-[#4B7D8D] border-b w-1/3 text-center text-l p-2">
              <h1>Role</h1>
            </div>
            <div className="flex justify-center pt-3">
              {currentUser.role === "master" && (
                <div className="bg-[#EBB305] w-28 text-white text-sm rounded-md p-1">
                  <h1 className="text-center">Master</h1>
                </div>
              )}
              {currentUser.role === "admin" && (
                <div className="bg-[#ccc] w-28 text-white text-sm rounded-md p-1">
                  <h1 className="text-center">Admin</h1>
                </div>
              )}
              {currentUser.role !== "master" &&
                currentUser.role !== "admin" && (
                  <div className="bg-[#A6634F] w-28 text-white text-sm rounded-md p-1">
                    <h1 className="text-center">Basic</h1>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
