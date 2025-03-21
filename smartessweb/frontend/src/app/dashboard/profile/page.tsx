"use client";

import React, { useState } from "react";
import ProfileCard from "@/app/components/ProfileComponents/ProfileCard";
import ProfileInfo from "@/app/components/ProfileComponents/ProfileInfo";
import ManagePasswordModal from "@/app/components/ProfileComponents/ManagePasswordModal";
import ManagePhoneNumberModal from "@/app/components/ProfileComponents/ManagePhoneNumberModal";
import ManageEmailModal from "@/app/components/ProfileComponents/ManageEmailModal";
import ManageFirstNameModal from "@/app/components/ProfileComponents/ManageFirstNameModal";
import ManageLastNameModal from "@/app/components/ProfileComponents/ManageLastNameModal";
import { useUserContext } from "@/context/UserProvider";

type ModalType =
  | "password"
  | "phone"
  | "email"
  | "firstName"
  | "lastName"
  | null;

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

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modalType: ModalType) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

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
            onOpenPassword={() => openModal("password")}
            onOpenPhoneNumber={() => openModal("phone")}
            onOpenEmail={() => openModal("email")}
            onOpenFirstName={() => openModal("firstName")}
            onOpenLastName={() => openModal("lastName")}
          />
        </div>
      </div>

      {activeModal === "password" && (
        <ManagePasswordModal
          isOpen={true}
          onClose={closeModal}
          onResetPassword={closeModal}
        />
      )}

      {activeModal === "phone" && (
        <ManagePhoneNumberModal
          isOpen={true}
          onClose={closeModal}
          onResetPhoneNumber={closeModal}
        />
      )}

      {activeModal === "email" && (
        <ManageEmailModal
          isOpen={true}
          onClose={closeModal}
          onResetEmail={closeModal}
        />
      )}
      {activeModal === "firstName" && (
        <ManageFirstNameModal
          isOpen={true}
          onClose={closeModal}
          onResetFirstName={closeModal}
        />
      )}
      {activeModal === "lastName" && (
        <ManageLastNameModal
          isOpen={true}
          onClose={closeModal}
          onResetLastName={closeModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;
