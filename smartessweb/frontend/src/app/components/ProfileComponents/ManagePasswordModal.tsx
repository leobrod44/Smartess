import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useState } from "react";
import { showToastError, showToastSuccess } from "../Toast";
import { manageAccountsApi } from "@/api/page";
import { authApi } from "@/api/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserProvider";

const ManagePasswordModal = ({
  isOpen,
  onClose,
  onResetPassword,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (password: string) => void;
}) => {
  const [showNewPassword, setshowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const router = useRouter();
  const {
    setUserId,
    setUserEmail,
    setUserFirstName,
    setUserLastName,
    setUserType,
    setUserProfilePicture,
    setUserPhoneNumber,
  } = useUserContext();

  const handleNewPasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    // For backend and debugging
    console.log(value);
  };

  const handleConfirmNewPasswordInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
  };

  // Submit form with password
  const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleReset();
  };

  const handleReset = async () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!newPassword || !confirmNewPassword) {
      showToastError("Please fill in all required fields");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      showToastError(
        "Password must be at least 8 characters long, include one capital letter, and one special character."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToastError("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToastError("No authentication token found");
        return;
      }

      await manageAccountsApi.updateUserInfoApi(token, {
        password: confirmNewPassword,
      });

      showToastSuccess("Password has been changed");
      onResetPassword(confirmNewPassword);
      setNewPassword("");
      setConfirmNewPassword("");
      onClose();
      handleLogout();
    } catch (error) {
      console.log(error);
      showToastError("Failed to update Password");
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      setUserId("");
      setUserEmail("");
      setUserFirstName("");
      setUserLastName("");
      setUserType("");
      setUserProfilePicture("");
      setUserPhoneNumber("");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      showToastError(
        error instanceof Error
          ? error.message
          : "An error occurred during logout"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <form onSubmit={handleFormSubmission}>
        <div className="bg-white rounded-xl shadow-lg p-10 w-[800px] h-[450px] relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="flex justify-center">
            <h2 className="text-4xl text-[#30525E] pt-10 font-sequel-sans font-extrabold">
              Modify Password
            </h2>
          </div>
          <div className="flex justify-center text-[#254752] text-xs mb-5">
            <h3 className="text-sm text-[#52525C] pt-5 font-sequel-sans-regular">
              Please create a new password.
            </h3>
          </div>
          <div className="flex justify-center text-[#254752] text-xs mb-5">
            <h3 className="text-sm text-[red] font-sequel-sans-regular">
              Must be 8 characters long, include one capital letter and one
              special character.
            </h3>
          </div>

          <div className="w-4/5 mx-auto flex flex-col justify-center pb-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  New Password
                </label>
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordInput}
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-2/4"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  Confirm New Password
                </label>
              </div>

              <div className="relative w-2/4">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordInput}
                  className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 pr-10 w-full"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => setshowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#266472] hover:text-[#1f505e] transition duration-300"
                    aria-label={
                      showNewPassword ? "Hide Password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
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

export default ManagePasswordModal;
