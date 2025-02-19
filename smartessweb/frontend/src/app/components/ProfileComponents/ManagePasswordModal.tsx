import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";
import React from "react";
import { useState } from "react";
import { showToastError, showToastSuccess } from "../Toast";

const ManagePasswordModal = ({
  isOpen,
  onClose,
  onReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onReset: (password: string) => void;
}) => {
  const [showNewPassword, setshowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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
  const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleReset();
  };

  const handleReset = () => {
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

    showToastSuccess("Reset email has been sent");
    onReset(confirmNewPassword);
    setNewPassword("");
    setConfirmNewPassword("");
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
              Manage Password
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
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-3/5"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  Confirm New Password
                </label>
              </div>

              <div className="relative w-3/5">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordInput}
                  className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 pr-10 w-full"
                />
                <IconButton
                  type="button"
                  onClick={() => setshowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#266472]"
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
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
