import React from "react";
import { useState } from "react";
import { showToastError, showToastSuccess } from "../Toast";
import { useUserContext } from "@/context/UserProvider";
import { manageAccountsApi } from "@/api/page";

const ManageEmailModal = ({
  isOpen,
  onClose,
  onResetEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResetEmail: (email: string) => void;
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const { setUserEmail } = useUserContext();

  const handleNewEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmail(value);
  };

  const handleConfirmNewEmailInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmEmail(value);
  };

  // Submit Form for Email change
  const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleReset();
  };

  const handleReset = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newEmail || !confirmEmail) {
      showToastError("Please fill in all required fields");
      return;
    }
    if (!emailRegex.test(confirmEmail)) {
      showToastError("Please enter a valid email");
      return;
    }

    if (newEmail !== confirmEmail) {
      showToastError("Email do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToastError("No authentication token found");
        return;
      }

      const response = await manageAccountsApi.updateUserInfoApi(token, {
        email: confirmEmail,
      });

      const updatedUser = response.user;
      if (updatedUser && updatedUser.email) {
        setUserEmail(updatedUser.email);
      }

      showToastSuccess("Email has been changed");
      onResetEmail(confirmEmail);
      setNewEmail("");
      setConfirmEmail("");
      onClose();
    } catch (error) {
      console.log(error);
      showToastError("Failed to update email");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <form onSubmit={handleFormSubmission}>
        <div className="bg-white rounded-xl shadow-lg p-10 w-[800px] h-[400px] relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="flex justify-center">
            <h2 className="text-4xl text-[#30525E] pt-10 font-sequel-sans font-extrabold">
              Modify Email
            </h2>
          </div>
          <div className="flex justify-center text-[#254752] text-xs mb-5">
            <h3 className="text-sm text-[red] pt-5 font-sequel-sans-regular">
              Please enter a valid new email.
            </h3>
          </div>

          <div className="w-5/6 mx-auto flex flex-col justify-center pb-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  New Email
                </label>
              </div>
              <input
                type="text"
                name="email"
                value={newEmail}
                onChange={handleNewEmailInput}
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-[290px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  Confirm New Email
                </label>
              </div>
              <input
                type="text"
                name="email"
                value={confirmEmail}
                onChange={handleConfirmNewEmailInput}
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-[290px]"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex justify-around w-5/6">
              <button
                className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
                type="submit"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageEmailModal;
