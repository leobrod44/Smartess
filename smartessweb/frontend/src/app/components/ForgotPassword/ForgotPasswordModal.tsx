import React from "react";
import { useState } from "react";
import Toast, { showToastError, showToastSuccess } from "../Toast";

const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onReset: (email: string) => void; // Pass email to onReset for further handling
}) => {
  const [email, setEmail] = useState("");

  // Log the email value to the console
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validEmail = e.target.value;
    setEmail(validEmail);
    console.log("Email:", validEmail);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = () => {
    if (!email) {
      showToastError("Please fill in all required fields");
      return;
    }
    if (!validateEmail(email)) {
      showToastError("Please enter a valid email.");
      return;
    }

    showToastSuccess("Reset Email has been sent");
    onReset(email); // Call the onReset function
    setEmail(""); // Clear the input after reset
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-1/2 max-h-full relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex justify-center">
          <h2 className="text-4xl text-[#30525E] pt-10 font-sequel-sans font-extrabold">
            Forgot Password?
          </h2>
        </div>

        <div className="flex justify-center text-[#254752] text-xs mb-5">
          <h3 className="text-sm text-[#52525C] pt-10 pb-2 font-sequel-sans-regular">
            A link will be sent to the provided email address with password
            reset instructions.
          </h3>
        </div>

        <div className="flex flex-col justify-center pb-10">
          <div className="flex items-center justify-center gap-4">
            <label className="text-sm font-sequel-sans-regular">
              Email Address
            </label>
            <input
              type="text"
              value={email}
              onChange={handleEmailChange}
              className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-80"
            />
          </div>
        </div>

        <div className="flex justify-around">
          <button
            className="bg-[#9b211b] text-white text-xs w-[110px] py-2 rounded-md transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#254752] text-white text-xs w-[110px] py-2 rounded-md transition duration-300"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
