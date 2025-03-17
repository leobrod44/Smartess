"use client";

import ProfileCard from "@/app/components/ProfileComponents/ProfileCard";
import ProfileInfo from "@/app/components/ProfileComponents/ProfileInfo";
import ManagePasswordModal from "@/app/components/ProfileComponents/ManagePasswordModal";
import ManagePhoneNumberModal from "@/app/components/ProfileComponents/ManagePhoneNumberModal";
import { useState } from "react";
import { useUserContext } from "@/context/UserProvider";

const ProfilePage = () => {
  const {
    userId,
    userEmail,
    userFirstName,
    userLastName,
    userType,
    userProfilePicture,
    userPhoneNumber,
  } = useUserContext();

  const [isManagePasswordOpen, setManagePasswordOpen] = useState(false);
  const [isManagePhoneNumberOpen, setManagePhoneNumberOpen] = useState(false);

  // Modal handler for password
  const handlePasswordOpenModal = () => {
    setManagePasswordOpen(true);
  };

  const handlePasswordCloseModal = () => {
    setManagePasswordOpen(false);
  };

  const handlePasswordReset = () => {
    setManagePasswordOpen(false);
  };

  // Modal handler for phone number
  const handlePhoneNumberOpenModal = () => {
    setManagePhoneNumberOpen(true);
  };

  const handlePhoneNumberCloseModal = () => {
    setManagePhoneNumberOpen(false);
  };

  const handlePhoneNumberReset = () => {
    setManagePhoneNumberOpen(false);
  };

  const currentUser = {
    userId: userId,
    role: userType,
    address: [],
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    profilePicture: userProfilePicture,
  };

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8">
      <div className="flex flex-col justify-between">
        <div className="flex flex-row">
          <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-3">
            <h4>Your Profile Page</h4>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-normal gap-4">
          {/* Left panel */}
          <ProfileCard currentUser={currentUser} />

          {/* Right panel */}
          <ProfileInfo
            currentUser={currentUser}
            onOpenPassword={handlePasswordOpenModal}
            onOpenPhoneNumber={handlePhoneNumberOpenModal}
          />
        </div>
      </div>
      {/* ModifyPassword Modal */}{" "}
      {isManagePasswordOpen && (
        <ManagePasswordModal
          isOpen={isManagePasswordOpen}
          onClose={handlePasswordCloseModal}
          onResetPassword={handlePasswordReset}
        />
      )}
      {/* PhoneNumber Modal */}
      {isManagePhoneNumberOpen && (
        <ManagePhoneNumberModal
          isOpen={isManagePhoneNumberOpen}
          onClose={handlePhoneNumberCloseModal}
          onResetPhoneNumber={handlePhoneNumberReset}
        />
      )}
    </div>
  );
};

export default ProfilePage;
